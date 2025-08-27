import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireRole, hashPassword, comparePassword, generateToken, seedSuperAdmin } from './middleware/auth';
import type { AuthRequest } from './middleware/auth';
import { 
  insertUserSchema, insertSocietySchema, insertSystemUserSchema, 
  insertMemberSchema, insertLoanSchema, insertMonthlyDemandSchema, 
  insertVoucherSchema, insertPendingEditSchema 
} from '@shared/schema';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_multer });

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed super admin on startup
  await seedSuperAdmin();

  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        message: 'Login successful', 
        token, 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
  });

  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const societies = await storage.getAllSocieties();
      const members = await storage.getAllMembers();
      const loans = await storage.getAllLoans();
      const pendingEdits = await storage.getPendingEditsByStatus('pending');

      const totalLoanAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.loanAmount), 0);

      res.json({
        totalSocieties: societies.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        totalLoans: totalLoanAmount,
        pendingApprovals: pendingEdits.length
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // Recent activities
  app.get('/api/dashboard/recent-loans', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const loans = await storage.getAllLoans();
      const recentLoans = loans.slice(0, 5);
      res.json(recentLoans);
    } catch (error) {
      console.error('Recent loans error:', error);
      res.status(500).json({ message: 'Failed to fetch recent loans' });
    }
  });

  // User management routes
  app.get('/api/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.put('/api/users/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }

      const user = await storage.updateUser(id, userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Society management routes
  app.get('/api/societies', authenticateToken, async (req, res) => {
    try {
      const societies = await storage.getAllSocieties();
      res.json(societies);
    } catch (error) {
      console.error('Get societies error:', error);
      res.status(500).json({ message: 'Failed to fetch societies' });
    }
  });

  app.post('/api/societies', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const societyData = insertSocietySchema.parse(req.body);
      const society = await storage.createSociety(societyData);
      res.status(201).json(society);
    } catch (error) {
      console.error('Create society error:', error);
      res.status(500).json({ message: 'Failed to create society' });
    }
  });

  app.put('/api/societies/:id', authenticateToken, requireRole(['super_admin', 'society_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const societyData = req.body;
      const society = await storage.updateSociety(id, societyData);
      res.json(society);
    } catch (error) {
      console.error('Update society error:', error);
      res.status(500).json({ message: 'Failed to update society' });
    }
  });

  // System Users routes
  app.get('/api/system-users', authenticateToken, async (req, res) => {
    try {
      const systemUsers = await storage.getAllSystemUsers();
      res.json(systemUsers);
    } catch (error) {
      console.error('Get system users error:', error);
      res.status(500).json({ message: 'Failed to fetch system users' });
    }
  });

  app.post('/api/system-users', authenticateToken, requireRole(['super_admin', 'society_admin']), async (req, res) => {
    try {
      const systemUserData = insertSystemUserSchema.parse(req.body);
      const systemUser = await storage.createSystemUser(systemUserData);
      res.status(201).json(systemUser);
    } catch (error) {
      console.error('Create system user error:', error);
      res.status(500).json({ message: 'Failed to create system user' });
    }
  });

  // Members routes
  app.get('/api/members', authenticateToken, async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      console.error('Get members error:', error);
      res.status(500).json({ message: 'Failed to fetch members' });
    }
  });

  app.post('/api/members', authenticateToken, requireRole(['super_admin', 'society_admin']), async (req, res) => {
    try {
      const memberData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      console.error('Create member error:', error);
      res.status(500).json({ message: 'Failed to create member' });
    }
  });

  app.put('/api/members/:id', authenticateToken, requireRole(['super_admin', 'society_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const memberData = req.body;
      const member = await storage.updateMember(id, memberData);
      res.json(member);
    } catch (error) {
      console.error('Update member error:', error);
      res.status(500).json({ message: 'Failed to update member' });
    }
  });

  // File upload for member photos and signatures
  app.post('/api/members/:id/photo', authenticateToken, requireRole(['super_admin', 'society_admin']), upload.single('photo'), async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const photoUrl = `/uploads/${req.file.filename}`;
      const member = await storage.updateMember(id, { photoUrl });
      res.json({ photoUrl, member });
    } catch (error) {
      console.error('Photo upload error:', error);
      res.status(500).json({ message: 'Failed to upload photo' });
    }
  });

  app.post('/api/members/:id/signature', authenticateToken, requireRole(['super_admin', 'society_admin']), upload.single('signature'), async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const signatureUrl = `/uploads/${req.file.filename}`;
      const member = await storage.updateMember(id, { signatureUrl });
      res.json({ signatureUrl, member });
    } catch (error) {
      console.error('Signature upload error:', error);
      res.status(500).json({ message: 'Failed to upload signature' });
    }
  });

  // Loans routes
  app.get('/api/loans', authenticateToken, async (req, res) => {
    try {
      const loans = await storage.getAllLoans();
      res.json(loans);
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({ message: 'Failed to fetch loans' });
    }
  });

  app.post('/api/loans', authenticateToken, requireRole(['super_admin', 'society_admin']), async (req, res) => {
    try {
      const loanData = insertLoanSchema.parse(req.body);
      // Auto-calculate net loan
      loanData.netLoan = (parseFloat(loanData.loanAmount.toString()) - parseFloat((loanData.previousLoan || 0).toString())).toString();
      
      const loan = await storage.createLoan(loanData);
      res.status(201).json(loan);
    } catch (error) {
      console.error('Create loan error:', error);
      res.status(500).json({ message: 'Failed to create loan' });
    }
  });

  // Monthly demand routes
  app.get('/api/monthly-demands', authenticateToken, async (req, res) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
      }
      
      const demands = await storage.getMonthlyDemandsByPeriod(
        parseInt(month as string), 
        parseInt(year as string)
      );
      res.json(demands);
    } catch (error) {
      console.error('Get monthly demands error:', error);
      res.status(500).json({ message: 'Failed to fetch monthly demands' });
    }
  });

  app.post('/api/monthly-demands', authenticateToken, requireRole(['super_admin', 'society_admin']), async (req, res) => {
    try {
      const demandData = insertMonthlyDemandSchema.parse(req.body);
      const demand = await storage.createMonthlyDemand(demandData);
      res.status(201).json(demand);
    } catch (error) {
      console.error('Create monthly demand error:', error);
      res.status(500).json({ message: 'Failed to create monthly demand' });
    }
  });

  // Vouchers routes
  app.get('/api/vouchers', authenticateToken, async (req, res) => {
    try {
      const vouchers = await storage.getAllVouchers();
      res.json(vouchers);
    } catch (error) {
      console.error('Get vouchers error:', error);
      res.status(500).json({ message: 'Failed to fetch vouchers' });
    }
  });

  app.post('/api/vouchers', authenticateToken, requireRole(['super_admin', 'society_admin']), async (req, res) => {
    try {
      const voucherData = insertVoucherSchema.parse(req.body);
      const voucher = await storage.createVoucher(voucherData);
      res.status(201).json(voucher);
    } catch (error) {
      console.error('Create voucher error:', error);
      res.status(500).json({ message: 'Failed to create voucher' });
    }
  });

  // Pending edits routes
  app.get('/api/pending-edits', authenticateToken, requireRole(['super_admin']), async (req, res) => {
    try {
      const pendingEdits = await storage.getAllPendingEdits();
      res.json(pendingEdits);
    } catch (error) {
      console.error('Get pending edits error:', error);
      res.status(500).json({ message: 'Failed to fetch pending edits' });
    }
  });

  app.post('/api/pending-edits', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const editData = insertPendingEditSchema.parse(req.body);
      editData.requestedBy = req.user!.id;
      
      const edit = await storage.createPendingEdit(editData);
      res.status(201).json(edit);
    } catch (error) {
      console.error('Create pending edit error:', error);
      res.status(500).json({ message: 'Failed to create pending edit' });
    }
  });

  app.put('/api/pending-edits/:id/approve', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      
      const edit = await storage.updatePendingEdit(id, {
        status: 'approved',
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        comments
      });
      
      res.json(edit);
    } catch (error) {
      console.error('Approve edit error:', error);
      res.status(500).json({ message: 'Failed to approve edit' });
    }
  });

  app.put('/api/pending-edits/:id/reject', authenticateToken, requireRole(['super_admin']), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      
      const edit = await storage.updatePendingEdit(id, {
        status: 'rejected',
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        comments
      });
      
      res.json(edit);
    } catch (error) {
      console.error('Reject edit error:', error);
      res.status(500).json({ message: 'Failed to reject edit' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
