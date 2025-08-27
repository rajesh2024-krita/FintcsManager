import { 
  users, societies, systemUsers, members, loans, monthlyDemands, vouchers, pendingEdits,
  type User, type InsertUser, type Society, type InsertSociety,
  type SystemUser, type InsertSystemUser, type Member, type InsertMember,
  type Loan, type InsertLoan, type MonthlyDemand, type InsertMonthlyDemand,
  type Voucher, type InsertVoucher, type PendingEdit, type InsertPendingEdit
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Societies
  getSociety(id: string): Promise<Society | undefined>;
  getAllSocieties(): Promise<Society[]>;
  createSociety(society: InsertSociety): Promise<Society>;
  updateSociety(id: string, society: Partial<InsertSociety>): Promise<Society>;
  deleteSociety(id: string): Promise<void>;

  // System Users
  getSystemUser(id: string): Promise<SystemUser | undefined>;
  getSystemUserByEDP(edpNo: string): Promise<SystemUser | undefined>;
  getAllSystemUsers(): Promise<SystemUser[]>;
  getSystemUsersBySociety(societyId: string): Promise<SystemUser[]>;
  createSystemUser(systemUser: InsertSystemUser): Promise<SystemUser>;
  updateSystemUser(id: string, systemUser: Partial<InsertSystemUser>): Promise<SystemUser>;
  deleteSystemUser(id: string): Promise<void>;

  // Members
  getMember(id: string): Promise<Member | undefined>;
  getMemberByMemNo(memNo: string): Promise<Member | undefined>;
  getAllMembers(): Promise<Member[]>;
  getMembersBySociety(societyId: string): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member>;
  deleteMember(id: string): Promise<void>;
  generateMemberNumber(): Promise<string>;

  // Loans
  getLoan(id: string): Promise<Loan | undefined>;
  getLoanByLoanNo(loanNo: string): Promise<Loan | undefined>;
  getAllLoans(): Promise<Loan[]>;
  getLoansBySociety(societyId: string): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, loan: Partial<InsertLoan>): Promise<Loan>;
  deleteLoan(id: string): Promise<void>;
  generateLoanNumber(): Promise<string>;

  // Monthly Demands
  getMonthlyDemand(id: string): Promise<MonthlyDemand | undefined>;
  getMonthlyDemandsByPeriod(month: number, year: number, societyId?: string): Promise<MonthlyDemand[]>;
  createMonthlyDemand(demand: InsertMonthlyDemand): Promise<MonthlyDemand>;
  updateMonthlyDemand(id: string, demand: Partial<InsertMonthlyDemand>): Promise<MonthlyDemand>;
  deleteMonthlyDemand(id: string): Promise<void>;

  // Vouchers
  getVoucher(id: string): Promise<Voucher | undefined>;
  getVoucherByVoucherNo(voucherNo: string): Promise<Voucher | undefined>;
  getAllVouchers(): Promise<Voucher[]>;
  getVouchersBySociety(societyId: string): Promise<Voucher[]>;
  createVoucher(voucher: InsertVoucher): Promise<Voucher>;
  updateVoucher(id: string, voucher: Partial<InsertVoucher>): Promise<Voucher>;
  deleteVoucher(id: string): Promise<void>;
  generateVoucherNumber(type: string): Promise<string>;

  // Pending Edits
  getPendingEdit(id: string): Promise<PendingEdit | undefined>;
  getAllPendingEdits(): Promise<PendingEdit[]>;
  getPendingEditsByStatus(status: string): Promise<PendingEdit[]>;
  createPendingEdit(edit: InsertPendingEdit): Promise<PendingEdit>;
  updatePendingEdit(id: string, edit: Partial<InsertPendingEdit>): Promise<PendingEdit>;
  deletePendingEdit(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...updateUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(asc(users.name));
  }

  // Societies
  async getSociety(id: string): Promise<Society | undefined> {
    const [society] = await db.select().from(societies).where(eq(societies.id, id));
    return society || undefined;
  }

  async getAllSocieties(): Promise<Society[]> {
    return db.select().from(societies).orderBy(asc(societies.name));
  }

  async createSociety(insertSociety: InsertSociety): Promise<Society> {
    const [society] = await db.insert(societies).values(insertSociety).returning();
    return society;
  }

  async updateSociety(id: string, updateSociety: Partial<InsertSociety>): Promise<Society> {
    const [society] = await db.update(societies)
      .set({ ...updateSociety, updatedAt: new Date() })
      .where(eq(societies.id, id))
      .returning();
    return society;
  }

  async deleteSociety(id: string): Promise<void> {
    await db.delete(societies).where(eq(societies.id, id));
  }

  // System Users
  async getSystemUser(id: string): Promise<SystemUser | undefined> {
    const [systemUser] = await db.select().from(systemUsers).where(eq(systemUsers.id, id));
    return systemUser || undefined;
  }

  async getSystemUserByEDP(edpNo: string): Promise<SystemUser | undefined> {
    const [systemUser] = await db.select().from(systemUsers).where(eq(systemUsers.edpNo, edpNo));
    return systemUser || undefined;
  }

  async getAllSystemUsers(): Promise<SystemUser[]> {
    return db.select().from(systemUsers).orderBy(asc(systemUsers.edpNo));
  }

  async getSystemUsersBySociety(societyId: string): Promise<SystemUser[]> {
    return db.select().from(systemUsers)
      .where(eq(systemUsers.societyId, societyId))
      .orderBy(asc(systemUsers.edpNo));
  }

  async createSystemUser(insertSystemUser: InsertSystemUser): Promise<SystemUser> {
    const [systemUser] = await db.insert(systemUsers).values(insertSystemUser).returning();
    return systemUser;
  }

  async updateSystemUser(id: string, updateSystemUser: Partial<InsertSystemUser>): Promise<SystemUser> {
    const [systemUser] = await db.update(systemUsers)
      .set({ ...updateSystemUser, updatedAt: new Date() })
      .where(eq(systemUsers.id, id))
      .returning();
    return systemUser;
  }

  async deleteSystemUser(id: string): Promise<void> {
    await db.delete(systemUsers).where(eq(systemUsers.id, id));
  }

  // Members
  async getMember(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member || undefined;
  }

  async getMemberByMemNo(memNo: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.memNo, memNo));
    return member || undefined;
  }

  async getAllMembers(): Promise<Member[]> {
    return db.select().from(members).orderBy(asc(members.memNo));
  }

  async getMembersBySociety(societyId: string): Promise<Member[]> {
    return db.select().from(members)
      .where(eq(members.societyId, societyId))
      .orderBy(asc(members.memNo));
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    if (!insertMember.memNo) {
      insertMember.memNo = await this.generateMemberNumber();
    }
    const [member] = await db.insert(members).values(insertMember).returning();
    return member;
  }

  async updateMember(id: string, updateMember: Partial<InsertMember>): Promise<Member> {
    const [member] = await db.update(members)
      .set({ ...updateMember, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return member;
  }

  async deleteMember(id: string): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  async generateMemberNumber(): Promise<string> {
    const lastMember = await db.select({ memNo: members.memNo })
      .from(members)
      .orderBy(desc(members.memNo))
      .limit(1);
    
    if (lastMember.length === 0) {
      return "MEM_001";
    }
    
    const lastNumber = parseInt(lastMember[0].memNo.split('_')[1]);
    const nextNumber = lastNumber + 1;
    return `MEM_${nextNumber.toString().padStart(3, '0')}`;
  }

  // Loans
  async getLoan(id: string): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan || undefined;
  }

  async getLoanByLoanNo(loanNo: string): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.loanNo, loanNo));
    return loan || undefined;
  }

  async getAllLoans(): Promise<Loan[]> {
    return db.select().from(loans).orderBy(desc(loans.loanDate));
  }

  async getLoansBySociety(societyId: string): Promise<Loan[]> {
    return db.select().from(loans)
      .where(eq(loans.societyId, societyId))
      .orderBy(desc(loans.loanDate));
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    if (!insertLoan.loanNo) {
      insertLoan.loanNo = await this.generateLoanNumber();
    }
    const [loan] = await db.insert(loans).values(insertLoan).returning();
    return loan;
  }

  async updateLoan(id: string, updateLoan: Partial<InsertLoan>): Promise<Loan> {
    const [loan] = await db.update(loans)
      .set({ ...updateLoan, updatedAt: new Date() })
      .where(eq(loans.id, id))
      .returning();
    return loan;
  }

  async deleteLoan(id: string): Promise<void> {
    await db.delete(loans).where(eq(loans.id, id));
  }

  async generateLoanNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    
    const lastLoan = await db.select({ loanNo: loans.loanNo })
      .from(loans)
      .orderBy(desc(loans.loanNo))
      .limit(1);
    
    if (lastLoan.length === 0) {
      return `L${yearSuffix}001`;
    }
    
    const lastNumber = parseInt(lastLoan[0].loanNo.slice(3));
    const nextNumber = lastNumber + 1;
    return `L${yearSuffix}${nextNumber.toString().padStart(3, '0')}`;
  }

  // Monthly Demands
  async getMonthlyDemand(id: string): Promise<MonthlyDemand | undefined> {
    const [demand] = await db.select().from(monthlyDemands).where(eq(monthlyDemands.id, id));
    return demand || undefined;
  }

  async getMonthlyDemandsByPeriod(month: number, year: number, societyId?: string): Promise<MonthlyDemand[]> {
    const conditions = [
      eq(monthlyDemands.month, month),
      eq(monthlyDemands.year, year)
    ];
    
    if (societyId) {
      conditions.push(eq(monthlyDemands.societyId, societyId));
    }
    
    return db.select().from(monthlyDemands)
      .where(and(...conditions))
      .orderBy(asc(monthlyDemands.edpNo));
  }

  async createMonthlyDemand(insertDemand: InsertMonthlyDemand): Promise<MonthlyDemand> {
    const [demand] = await db.insert(monthlyDemands).values(insertDemand).returning();
    return demand;
  }

  async updateMonthlyDemand(id: string, updateDemand: Partial<InsertMonthlyDemand>): Promise<MonthlyDemand> {
    const [demand] = await db.update(monthlyDemands)
      .set({ ...updateDemand, updatedAt: new Date() })
      .where(eq(monthlyDemands.id, id))
      .returning();
    return demand;
  }

  async deleteMonthlyDemand(id: string): Promise<void> {
    await db.delete(monthlyDemands).where(eq(monthlyDemands.id, id));
  }

  // Vouchers
  async getVoucher(id: string): Promise<Voucher | undefined> {
    const [voucher] = await db.select().from(vouchers).where(eq(vouchers.id, id));
    return voucher || undefined;
  }

  async getVoucherByVoucherNo(voucherNo: string): Promise<Voucher | undefined> {
    const [voucher] = await db.select().from(vouchers).where(eq(vouchers.voucherNo, voucherNo));
    return voucher || undefined;
  }

  async getAllVouchers(): Promise<Voucher[]> {
    return db.select().from(vouchers).orderBy(desc(vouchers.voucherDate));
  }

  async getVouchersBySociety(societyId: string): Promise<Voucher[]> {
    return db.select().from(vouchers)
      .where(eq(vouchers.societyId, societyId))
      .orderBy(desc(vouchers.voucherDate));
  }

  async createVoucher(insertVoucher: InsertVoucher): Promise<Voucher> {
    if (!insertVoucher.voucherNo) {
      insertVoucher.voucherNo = await this.generateVoucherNumber(insertVoucher.voucherType);
    }
    const [voucher] = await db.insert(vouchers).values(insertVoucher).returning();
    return voucher;
  }

  async updateVoucher(id: string, updateVoucher: Partial<InsertVoucher>): Promise<Voucher> {
    const [voucher] = await db.update(vouchers)
      .set({ ...updateVoucher, updatedAt: new Date() })
      .where(eq(vouchers.id, id))
      .returning();
    return voucher;
  }

  async deleteVoucher(id: string): Promise<void> {
    await db.delete(vouchers).where(eq(vouchers.id, id));
  }

  async generateVoucherNumber(type: string): Promise<string> {
    const typePrefix = type.charAt(0).toUpperCase();
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    
    const lastVoucher = await db.select({ voucherNo: vouchers.voucherNo })
      .from(vouchers)
      .where(eq(vouchers.voucherType, type as any))
      .orderBy(desc(vouchers.voucherNo))
      .limit(1);
    
    if (lastVoucher.length === 0) {
      return `${typePrefix}${yearSuffix}001`;
    }
    
    const lastNumber = parseInt(lastVoucher[0].voucherNo.slice(3));
    const nextNumber = lastNumber + 1;
    return `${typePrefix}${yearSuffix}${nextNumber.toString().padStart(3, '0')}`;
  }

  // Pending Edits
  async getPendingEdit(id: string): Promise<PendingEdit | undefined> {
    const [edit] = await db.select().from(pendingEdits).where(eq(pendingEdits.id, id));
    return edit || undefined;
  }

  async getAllPendingEdits(): Promise<PendingEdit[]> {
    return db.select().from(pendingEdits).orderBy(desc(pendingEdits.createdAt));
  }

  async getPendingEditsByStatus(status: string): Promise<PendingEdit[]> {
    return db.select().from(pendingEdits)
      .where(eq(pendingEdits.status, status))
      .orderBy(desc(pendingEdits.createdAt));
  }

  async createPendingEdit(insertEdit: InsertPendingEdit): Promise<PendingEdit> {
    const [edit] = await db.insert(pendingEdits).values(insertEdit).returning();
    return edit;
  }

  async updatePendingEdit(id: string, updateEdit: Partial<InsertPendingEdit>): Promise<PendingEdit> {
    const [edit] = await db.update(pendingEdits)
      .set(updateEdit)
      .where(eq(pendingEdits.id, id))
      .returning();
    return edit;
  }

  async deletePendingEdit(id: string): Promise<void> {
    await db.delete(pendingEdits).where(eq(pendingEdits.id, id));
  }
}

export const storage = new DatabaseStorage();
