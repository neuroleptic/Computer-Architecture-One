const INIT = 0b00000001;
const SET  = 0b00000010;
const SAVE = 0b00000100;
const MUL = 0b00000101;
const PRN = 0b00000110;
const HALT = 0b00000000;
const ADD = 0b00000111;
const SUB = 0b00001111;
const DIV = 0b00011111;
const INC = 0b10001111;
const DEC = 0b00101111;
const PRA = 0b00111111;
const PUSH = 0b00001110;
const POP = 0b00011110;
const INC = 0b00101110;
const DEC = 0b00111110;
const CALL = 0b00010011;
const RET = 0b01011111;
const LD = 0b11111110;
const ST = 0b10111110;
const LDRI = 0b10110110;
const STRI = 0b10100110;
const JMP = 0b01011110;
const CMP = 0b01010110;
const JEQ = 0b01010010;
const JNE = 0b01000010;
const SP = 0xff;

class CPU {
  constructor() {
    this.mem = new Array(256);
    this.mem.fill(0);

    this.curReg = 0;
    this.reg = new Array(256);
    this.reg.fill(0);

    this.reg.PC = 0;

    this.buildBranchTable();

    this.flags = {};
  }

  buildBranchTable() {
    this.branchTable = {
      [INIT]: this.INIT,
      [SET]: this.SET,
      [SAVE]: this.SAVE,
      [MUL]: this.MUL,
      [PRN]: this.PRN,
      [HALT]: this.HALT,
      [ADD]: this.ADD,
      [SUB]: this.SUB,
      [DIV]: this.DIV,
      [INC]: this.INC,
      [DEC]: this.DEC,
      [PRA]: this.PRA,
      [PUSH]: this.PUSH,
      [POP]: this.POP,
      [CALL]: this.CALL,
      [RET]: this.RET,
      [LD]: this.LD,
      [ST]: this.ST,
      [JMP]: this.JMP,
      [LDRI]: this.LDRI,
      [STRI]: this.STRI,
      [CMP]: this.CMP,
      [JEQ]: this.JEQ,
      [JNE]: this.JNE
    };
  }

  poke(address, value) {
    this.mem[address] = value;
  }

  startClock() {
    this.clock = setInterval(() => { this.tick(); }, 100);
  }

  stopClock() {
    clearInterval(this.clock);
  }

  tick() {
    const currentInstruction = this.mem[this.reg.PC];

    const handler = this.branchTable[currentInstruction];

    if (handler === undefined) {
      console.error("ERROR: invalid instruction " + currentInstruction);
      this.stopClock();
      return;
    }

    handler.call(this);
  }

  INIT() {
    this.curReg = 0;
    this.reg.PC += 1;
  }

  SET() {
    this.curReg = this.mem[this.reg.PC + 1];
    this.reg.PC += 2;
  }

  SAVE() {
    this.reg[this.curReg] = this.mem[this.reg.PC + 1];
    this.reg.PC += 2;
  }

  MUL() {
    const reg0 = this.mem[this.reg.PC + 1];
    const reg1 = this.mem[this.reg.PC + 2];
    const value0 = this.reg[reg0];
    const value1 = this.reg[reg1];
    
    this.reg[this.curReg] = value0 * value1;
    this.reg.PC += 3;
  }

  ADD() {
    const reg0 = this.mem[this.reg.PC + 1];
    const reg1 = this.mem[this.reg.PC + 2];
    
    const value0 = this.reg[reg0];
    const value1 = this.reg[reg1];
    
    this.reg[this.curReg] = value0 + value1;

    this.reg.PC += 3;
  }

  SUB() {
    const reg0 = this.mem[this.reg.PC + 1];
    const reg1 = this.mem[this.reg.PC + 2];
    
    const value0 = this.reg[reg0];
    const value1 = this.reg[reg1];
    
    this.reg[this.curReg] = value0 - value1;

    this.reg.PC += 3;
  }

  DIV() {
    const reg0 = this.mem[this.reg.PC + 1];
    const reg1 = this.mem[this.reg.PC + 2];
    
    const value0 = this.reg[reg0];
    const value1 = this.reg[reg1];

    if(value1 === 0){
      console.log('Cannot divide by 0');
      process.exit();
    }
    
    this.reg[this.curReg] = value0 / value1;

    this.reg.PC += 3;
  }

  INC(register) {
    const value = this.reg[register] + 1;
    if(value > 255) {
      value = 0;
    }
    this.reg[register] = value;
    this.reg.PC += 1;
  }

  DEC(register) {
    const value = this.reg[register] - 1;
    if(value < 0) {
      value = 255;
    }
    this.reg[register] = value;
    this.reg.PC += 1;    
  }

  PRA() {
    process.stdout.write(String.fromCharCode(this.reg[this.curReg]));
    this.reg.PC += 1;
  }

  PRN() {
    console.log(this.reg[this.curReg]);  
    this.reg.PC += 1;
  }

  _push(value) {
    this.DEC(SP);
    this.mem[SP] = value;
  }

  PUSH() {
    this._push(this.reg[this.curReg]);
    this.reg.PC += 1;
    
  }

  _pop() {
    const value = this.mem[SP];
    this.INC(SP);
    return value;
  }

  POP() {
    this.reg[this.curReg] = this.mem[this.reg[SP]];
    this.reg.PC += 1;
  }

  CALL() {
    this._push(this.reg.PC + 1);
    this.reg.PC = this.reg[this.curReg];
  }

  RET() {
    this.reg.PC = this._pop();
  }

  LD() {
    const address = this.mem[this.reg.PC + 1];
    const value = this.mem[address];
    this.reg[this.curReg] = value;
    this.reg.PC += 2;
  }

  ST() {
    const address = this.mem[this.reg.PC + 1];
    this.mem[address] = this.reg[this.curReg];
    this.reg.PC += 2;
  }

  LDRI() {
    const regNum = this.reg.PC + 1;
    const address = this.reg[regNum];
    const value =  this.mem[address];
    this.reg[this.curReg] = value;
    this.reg.PC += 2;
  }

  STRI() {
    const regNum = this.reg.PC + 1;
    const address = this.reg[regNum];
    this.mem[address] = this.reg[this.curReg];
    this.reg.PC += 2;
  }

  JMP() {
    const address = this.reg.PC + 1;
    this.reg.PC = address;
  }

  CMP() {
    const regNum = this.reg.PC + 1;
    this.flags.equal = this.reg[this.curReg] === this.reg[regNum];
    this.reg.PC += 2;    
  }

  JEQ() {
    if(this.flags.equal){
      const address = this.reg.PC + 1;
      this.reg.PC = address;
    } else {
      this.reg.PC += 2;
    }
  }

  JNE() {
    if(!this.flags.equal){
      const address = this.reg.PC + 1;
      this.reg.PC = address;
    } else {
      this.reg.PC += 2;
    }
  }

  HALT() {
    this.stopClock();
  }
}

module.exports = CPU;