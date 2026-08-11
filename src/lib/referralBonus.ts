// Referral bonus configuration (prototype — persisted in sessionStorage)

export type ReferralBonusSettings = {
  enabled: boolean;
  inviterBonus: number;      // Points credited to the inviter
  inviteeBonus: number;      // Points credited to the new user
  minFirstOrderValue: number; // Minimum first order value (Pts) before bonus triggers
  maxReferralsPerUser: number; // 0 = unlimited
  payoutDelayHours: number;   // Delay after qualifying order before auto-credit
};

const KEY = "cardchat_referral_bonus_v1";

export const defaultReferralBonus: ReferralBonusSettings = {
  enabled: true,
  inviterBonus: 500,
  inviteeBonus: 200,
  minFirstOrderValue: 5000,
  maxReferralsPerUser: 0,
  payoutDelayHours: 0,
};

export function getReferralBonus(): ReferralBonusSettings {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return defaultReferralBonus;
    return { ...defaultReferralBonus, ...JSON.parse(raw) };
  } catch {
    return defaultReferralBonus;
  }
}

export function setReferralBonus(s: ReferralBonusSettings) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
