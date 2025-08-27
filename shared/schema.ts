import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["super_admin", "society_admin", "user", "member"]);
export const loanTypeEnum = pgEnum("loan_type", ["general", "personal", "housing", "vehicle", "education", "others"]);
export const voucherTypeEnum = pgEnum("voucher_type", ["payment", "receipt", "journal", "contra", "adjustment", "others"]);
export const paymentModeEnum = pgEnum("payment_mode", ["cash", "cheque", "opening"]);
export const memberStatusEnum = pgEnum("member_status", ["active", "inactive"]);
export const deductionTypeEnum = pgEnum("deduction_type", ["share", "withdrawal", "g_loan_instalment", "e_loan_instalment"]);

// Users table (for authentication and basic user management)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  name: text("name").notNull(),
  email: text("email").unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Societies table
export const societies = pgTable("societies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  registrationNumber: text("registration_number"),
  adminUserId: varchar("admin_user_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System users (EDP based users)
export const systemUsers = pgTable("system_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  edpNo: text("edp_no").notNull().unique(),
  name: text("name").notNull(),
  addressOffice: text("address_office"),
  addressResidence: text("address_residence"),
  designation: text("designation"),
  phoneOffice: text("phone_office"),
  phoneResidence: text("phone_residence"),
  mobile: text("mobile"),
  email: text("email"),
  username: text("username").unique(),
  password: text("password"),
  societyId: varchar("society_id").references(() => societies.id),
  userId: varchar("user_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Members table
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memNo: text("mem_no").notNull().unique(),
  name: text("name").notNull(),
  fatherHusbandName: text("father_husband_name"),
  officeAddress: text("office_address"),
  city: text("city"),
  phoneOffice: text("phone_office"),
  branch: text("branch"),
  phoneResidence: text("phone_residence"),
  mobile: text("mobile"),
  designation: text("designation"),
  residenceAddress: text("residence_address"),
  dateOfBirth: timestamp("date_of_birth"),
  dateOfJoiningSociety: timestamp("date_of_joining_society"),
  email: text("email"),
  dateOfJoiningOrg: timestamp("date_of_joining_org"),
  dateOfRetirement: timestamp("date_of_retirement"),
  nominee: text("nominee"),
  nomineeRelation: text("nominee_relation"),
  openingBalanceShare: decimal("opening_balance_share", { precision: 15, scale: 2 }).default("0"),
  openingBalanceType: text("opening_balance_type"), // Cr/Dr/CD
  bankName: text("bank_name"),
  bankPayableAt: text("bank_payable_at"),
  bankAccountNo: text("bank_account_no"),
  status: memberStatusEnum("status").notNull().default("active"),
  statusDate: timestamp("status_date").defaultNow(),
  deductions: text("deductions").array(), // Multiple deduction types
  photoUrl: text("photo_url"),
  signatureUrl: text("signature_url"),
  societyId: varchar("society_id").references(() => societies.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loans table
export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanNo: text("loan_no").notNull().unique(),
  loanType: loanTypeEnum("loan_type").notNull(),
  loanDate: timestamp("loan_date").notNull(),
  edpNo: text("edp_no").notNull(),
  memberName: text("member_name").notNull(),
  loanAmount: decimal("loan_amount", { precision: 15, scale: 2 }).notNull(),
  previousLoan: decimal("previous_loan", { precision: 15, scale: 2 }).default("0"),
  netLoan: decimal("net_loan", { precision: 15, scale: 2 }).notNull(),
  numberOfInstallments: integer("number_of_installments").notNull(),
  installmentAmount: decimal("installment_amount", { precision: 15, scale: 2 }).notNull(),
  purpose: text("purpose"),
  authorizedBy: text("authorized_by"),
  paymentMode: paymentModeEnum("payment_mode").notNull(),
  bankName: text("bank_name"),
  chequeNo: text("cheque_no"),
  chequeDate: timestamp("cheque_date"),
  share: decimal("share", { precision: 15, scale: 2 }).default("0"),
  cd: decimal("cd", { precision: 15, scale: 2 }).default("0"),
  lastSalary: decimal("last_salary", { precision: 15, scale: 2 }).default("0"),
  mwf: decimal("mwf", { precision: 15, scale: 2 }).default("0"),
  payAmount: decimal("pay_amount", { precision: 15, scale: 2 }).default("0"),
  givenSection: jsonb("given_section"), // Array of members
  takenSection: jsonb("taken_section"), // Array of members
  societyId: varchar("society_id").references(() => societies.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Monthly Demand table
export const monthlyDemands = pgTable("monthly_demands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  edpNo: text("edp_no").notNull(),
  memberName: text("member_name").notNull(),
  loanAmount: decimal("loan_amount", { precision: 15, scale: 2 }).default("0"),
  cd: decimal("cd", { precision: 15, scale: 2 }).default("0"),
  loan: decimal("loan", { precision: 15, scale: 2 }).default("0"),
  interest: decimal("interest", { precision: 15, scale: 2 }).default("0"),
  eLoan: decimal("e_loan", { precision: 15, scale: 2 }).default("0"),
  eInterest: decimal("e_interest", { precision: 15, scale: 2 }).default("0"),
  net: decimal("net", { precision: 15, scale: 2 }).default("0"),
  intDue: decimal("int_due", { precision: 15, scale: 2 }).default("0"),
  pInt: decimal("p_int", { precision: 15, scale: 2 }).default("0"),
  pDed: decimal("p_ded", { precision: 15, scale: 2 }).default("0"),
  las: decimal("las", { precision: 15, scale: 2 }).default("0"),
  lasIntDue: decimal("las_int_due", { precision: 15, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).default("0"),
  societyId: varchar("society_id").references(() => societies.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vouchers table
export const vouchers = pgTable("vouchers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  voucherNo: text("voucher_no").notNull().unique(),
  voucherType: voucherTypeEnum("voucher_type").notNull(),
  voucherDate: timestamp("voucher_date").notNull(),
  entries: jsonb("entries"), // Array of debit/credit entries
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).default("0"),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).default("0"),
  chequeNo: text("cheque_no"),
  chequeDate: timestamp("cheque_date"),
  narration: text("narration"),
  remarks: text("remarks"),
  passDate: timestamp("pass_date"),
  societyId: varchar("society_id").references(() => societies.id),
  createdBy: varchar("created_by").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pending Edits table (for approval workflow)
export const pendingEdits = pgTable("pending_edits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // 'society', 'member', 'user', etc.
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes").notNull(), // The proposed changes
  requestedBy: varchar("requested_by").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  adminOfSociety: one(societies, {
    fields: [users.id],
    references: [societies.adminUserId],
  }),
  systemUser: one(systemUsers, {
    fields: [users.id],
    references: [systemUsers.userId],
  }),
  createdVouchers: many(vouchers),
  requestedEdits: many(pendingEdits, { relationName: "requestedEdits" }),
  reviewedEdits: many(pendingEdits, { relationName: "reviewedEdits" }),
}));

export const societiesRelations = relations(societies, ({ one, many }) => ({
  admin: one(users, {
    fields: [societies.adminUserId],
    references: [users.id],
  }),
  systemUsers: many(systemUsers),
  members: many(members),
  loans: many(loans),
  monthlyDemands: many(monthlyDemands),
  vouchers: many(vouchers),
}));

export const systemUsersRelations = relations(systemUsers, ({ one }) => ({
  society: one(societies, {
    fields: [systemUsers.societyId],
    references: [societies.id],
  }),
  user: one(users, {
    fields: [systemUsers.userId],
    references: [users.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  society: one(societies, {
    fields: [members.societyId],
    references: [societies.id],
  }),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  society: one(societies, {
    fields: [loans.societyId],
    references: [societies.id],
  }),
}));

export const monthlyDemandsRelations = relations(monthlyDemands, ({ one }) => ({
  society: one(societies, {
    fields: [monthlyDemands.societyId],
    references: [societies.id],
  }),
}));

export const vouchersRelations = relations(vouchers, ({ one }) => ({
  society: one(societies, {
    fields: [vouchers.societyId],
    references: [societies.id],
  }),
  creator: one(users, {
    fields: [vouchers.createdBy],
    references: [users.id],
  }),
}));

export const pendingEditsRelations = relations(pendingEdits, ({ one }) => ({
  requester: one(users, {
    fields: [pendingEdits.requestedBy],
    references: [users.id],
    relationName: "requestedEdits",
  }),
  reviewer: one(users, {
    fields: [pendingEdits.reviewedBy],
    references: [users.id],
    relationName: "reviewedEdits",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocietySchema = createInsertSchema(societies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemUserSchema = createInsertSchema(systemUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMonthlyDemandSchema = createInsertSchema(monthlyDemands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPendingEditSchema = createInsertSchema(pendingEdits).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Society = typeof societies.$inferSelect;
export type InsertSociety = z.infer<typeof insertSocietySchema>;

export type SystemUser = typeof systemUsers.$inferSelect;
export type InsertSystemUser = z.infer<typeof insertSystemUserSchema>;

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;

export type MonthlyDemand = typeof monthlyDemands.$inferSelect;
export type InsertMonthlyDemand = z.infer<typeof insertMonthlyDemandSchema>;

export type Voucher = typeof vouchers.$inferSelect;
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;

export type PendingEdit = typeof pendingEdits.$inferSelect;
export type InsertPendingEdit = z.infer<typeof insertPendingEditSchema>;
