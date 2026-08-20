/**
 * Credits/Coins System
 * 
 * #30 - Credits implementation
 * Rules:
 * - Members earn 1 credit per message
 * - Staff can add/remove credits
 * - Staff changes should be audited
 * - Shop purchases use credits
 * - Avatar decorations cost 1000 credits each
 * - DO NOT execute another global reset (already done in 2026-08-17)
 */

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'staff_add' | 'staff_remove' | 'purchase';
  description: string;
  createdAt: Date;
  auditLog?: {
    staffId: string;
    reason: string;
    previousBalance: number;
    newBalance: number;
  };
}

export interface UserCredits {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastEarnedAt?: Date;
}

// Credit amounts for various actions
export const CREDIT_AMOUNTS = {
  MESSAGE_EARN: 1,           // Earn 1 credit per message
  DAILY_BONUS: 10,          // Daily login bonus
  DECORATION_COST: 1000,     // Avatar decoration price
  PREMIUM_THEME_COST: 500,   // Premium theme unlock
} as const;

// Staff action reasons (for audit)
export const STAFF_REASONS = [
  'reward',
  'compensation',
  'correction',
  'event_prize',
  'refund',
  'violation_penalty',
] as const;

/**
 * Client-side credits service
 * In production, this would call /api/credits endpoints
 */
export class CreditsService {
  private static instance: CreditsService;
  private cache: Map<string, UserCredits> = new Map();

  static getInstance(): CreditsService {
    if (!CreditsService.instance) {
      CreditsService.instance = new CreditsService();
    }
    return CreditsService.instance;
  }

  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<UserCredits | null> {
    try {
      // In production: GET /api/credits/:userId
      const response = await fetch(`/api/credits/${userId}`);
      
      if (!response.ok) {
        console.error('[Credits] Failed to fetch balance:', response.status);
        return null;
      }

      const data = await response.json();
      this.cache.set(userId, data);
      return data;
    } catch (error) {
      console.error('[Credits] Error fetching balance:', error);
      return this.cache.get(userId) || null;
    }
  }

  /**
   * #30 - Earn credits (e.g., for sending a message)
   */
  async earnCredits(userId: string, amount: number = CREDIT_AMOUNTS.MESSAGE_EARN): Promise<boolean> {
    try {
      const response = await fetch('/api/credits/earn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, type: 'message' }),
      });

      if (!response.ok) {
        console.error('[Credits] Failed to earn:', response.status);
        return false;
      }

      // Update local cache
      const current = this.cache.get(userId);
      if (current) {
        current.balance += amount;
        current.totalEarned += amount;
        current.lastEarnedAt = new Date();
      }

      return true;
    } catch (error) {
      console.error('[Credits] Error earning:', error);
      return false;
    }
  }

  /**
   * #30 - Spend credits (e.g., for shop purchase)
   */
  async spendCredits(
    userId: string, 
    amount: number, 
    description: string
  ): Promise<{ success: boolean; insufficientFunds?: boolean }> {
    try {
      // Check local cache first for quick insufficient funds check
      const current = this.cache.get(userId);
      if (current && current.balance < amount) {
        return { success: false, insufficientFunds: true };
      }

      const response = await fetch('/api/credits/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, description }),
      });

      if (response.status === 402) {
        return { success: false, insufficientFunds: true };
      }

      if (!response.ok) {
        console.error('[Credits] Failed to spend:', response.status);
        return { success: false };
      }

      // Update local cache
      if (current) {
        current.balance -= amount;
        current.totalSpent += amount;
      }

      return { success: true };
    } catch (error) {
      console.error('[Credits] Error spending:', error);
      return { success: false };
    }
  }

  /**
   * #30 - Staff action: Add credits (with audit)
   */
  async staffAddCredits(
    targetUserId: string,
    staffUserId: string,
    amount: number,
    reason: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/credits/staff/add', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Staff-Action': 'true',
        },
        body: JSON.stringify({
          targetUserId,
          staffUserId,
          amount,
          reason,
          audit: true,
        }),
      });

      if (!response.ok) {
        console.error('[Credits] Staff add failed:', response.status);
        return false;
      }

      console.log(`[Credits Audit] Staff ${staffUserId} added ${amount} credits to ${targetUserId}. Reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('[Credits] Error in staff add:', error);
      return false;
    }
  }

  /**
   * #30 - Staff action: Remove credits (with audit)
   */
  async staffRemoveCredits(
    targetUserId: string,
    staffUserId: string,
    amount: number,
    reason: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/credits/staff/remove', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Staff-Action': 'true',
        },
        body: JSON.stringify({
          targetUserId,
          staffUserId,
          amount,
          reason,
          audit: true,
        }),
      });

      if (!response.ok) {
        console.error('[Credits] Staff remove failed:', response.status);
        return false;
      }

      console.log(`[Credits Audit] Staff ${staffUserId} removed ${amount} credits from ${targetUserId}. Reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('[Credits] Error in staff remove:', error);
      return false;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit?: number): Promise<CreditTransaction[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await fetch(`/api/credits/${userId}/history${params}`);
      
      if (!response.ok) return [];
      
      return await response.json();
    } catch (error) {
      console.error('[Credits] Error fetching history:', error);
      return [];
    }
  }

  /**
   * Clear cached data
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }
}

// Export singleton
export const creditsService = CreditsService.getInstance();
