import {Data, hex} from './util.js';

function page(addr: number): number {
  return addr >>> 13;
}

class Chunk {
  page: number;
  pos: number;

  constructor(readonly start: number, readonly end: number) {
    this.page = page(start);
    if (page(end - 1) !== this.page) throw new Error('Chunk spans pages');
    this.pos = start;
  }

  free() {
    return this.end - this.pos;
  }

  /** Returns the address (>= 0) if found, or -1 if not found. */
  find(data: Data<number>, rom: Uint8Array): number {
    for (let i = this.start; i <= this.pos - data.length; i++) {
      let found = true;
      for (let j = 0; j < data.length; j++) {
        if (rom[i + j] !== data[j]) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
    // console.log(`could not find ${data.map(x=>x.toString(16))}`);
    return -1;
  }
}

interface Write {
  readonly data: Data<number>;
  readonly resolve: (address: number) => void;
  readonly reject: (err: unknown) => void;
  readonly startPage: number;
  readonly endPage: number; // inclusive
  readonly name: string;
}

// type Data = Uint8Array | number[];

export class Writer {

  //private writing = false;

  private readonly chunks: Chunk[] = [];
  private writes: Write[] = [];
  private promises: Promise<unknown>[] = [];

  constructor(readonly rom: Uint8Array, readonly chr: Uint8Array) {}

  private free: number[] = [];

  // TODO: move()?

  /** Note: start and end pages must be the same!  'end' is exclusive. */
  alloc(start: number, end: number) {
    while (page(end - 1) > page(start)) {
      const boundary = (page(start) + 1) << 13;
      this.addChunk(new Chunk(start, boundary - 1));
      start = boundary;
    }
    this.addChunk(new Chunk(start, end));
  }

  addChunk(c: Chunk) {
    this.chunks.push(c);
    this.free[c.page] = (this.free[c.page] || 0) + c.free();
  }

  // TODO: consider renaming this to queue() or plan() or something?
  async write(data: Data<number>, start: number, end: number, name: string): Promise<number> {
    //if (this.writing) console.log(`Late write: ${name}`);
    const startPage = page(start);
    const endPage = page(end - 1);
    const p = new Promise<number>((resolve, reject) => {
      this.writes.push({data, resolve, reject, startPage, endPage, name});
    });
    this.promises.push(p.catch(() => {}));
    return p;
  }

  async commit(): Promise<void> {
    //this.writing = true;
    while (this.writes.length) {
      const writes = this.writes;
      this.writes = [];
      const promises = this.promises;
      this.promises = [];
      writes.sort(
          (a, b) => ((a.endPage - a.startPage) - (b.endPage - b.startPage)) ||
          (b.data.length - a.data.length));
      for (const write of writes) {
        const address = this.find(write);
        if (address >= 0) {
          //console.log(`${write.name}: overlaps at ${hex(address)}`);
          write.resolve(address);
        } else {
          this.writeOne(write);
        }
      }
      await Promise.all(promises);
      // NOTE: This is pretty bad - how can we tell when all the constituent
      // promises are actually added???
      await 0;
      await 0;
      await 0;
    }
    //this.writing = false;
    // console.log(`Finished writing $${this.start.toString(16)}..$${this.pos.toString(16)
    //              }.  ${this.end - this.pos} bytes free`);
    // TODO - summarize all free chunks???
    //   -- feed free chunk given page into define for assembler?
  }

  private find({data, startPage, endPage}: Write): number {
    for (const chunk of this.chunks) {
      if (chunk.page < startPage || chunk.page > endPage) continue;
      const found = chunk.find(data, this.rom);
      if (found >= 0) return found;
    }
    return -1;
  }

  private writeOne(write: Write) {
    // find a chunk with enough space to fit the data.
    for (const chunk of this.chunks) {
      if (chunk.page < write.startPage || chunk.page > write.endPage) continue;
      if (chunk.free() < write.data.length) continue;
      // looks like it fits!
      this.rom.subarray(chunk.pos, chunk.pos + write.data.length).set(write.data);
      write.resolve(chunk.pos);
      this.free[chunk.page] -= write.data.length;
      // console.log(`${write.name}: writing ${write.data.length} bytes at ${
      //              hex(chunk.pos)}: ${Array.from(write.data, hex).join(' ')} | FREE ${
      //              this.free.map((v:number,k:number)=>`${hex(2*k)}:${v}`).join('/')}`);
      chunk.pos += write.data.length;
      return;
    }

    // console.log(`LOOKING FOR CHUNK: ${write.data.length} bytes in ${hex(write.startPage)
    //                  }..${hex(write.endPage)}`);
    // for (const chunk of this.chunks) {
    //   if (chunk.page < write.startPage || chunk.page > write.endPage) {
    //     console.log(`wrong page: ${hex(chunk.pos)}..${hex(chunk.end)} -> ${hex(chunk.page)}`); continue;
    //   }
    //   if (chunk.free() < write.data.length) {
    //     console.log(`not enough free: ${hex(chunk.pos)}..${hex(chunk.end)} -> ${chunk.free()}`); continue;
    //   }
    // }
    //console.log(this.chunks);
    console.log(`${write.name}: WRITE FAILED ${write.data.length} bytes: ${
                 Array.from(write.data, hex).join(' ')}`);
    write.reject(
        new Error(`Could not find sufficient chunk in ${hex(write.startPage)
                       }..${hex(write.endPage)} to write ${write.name}: ${write.data}`));
  }
}
