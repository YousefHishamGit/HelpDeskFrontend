export enum TicketPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export enum TicketStatus {
  Open = 0,
  Assigned = 1,
  InProgress = 2,
  Resolved = 3,
  Closed = 4
}

export enum UserRole {
  Employee = 0,
  Agent = 1,
  Admin = 2
}

export const TicketPriorityLabels: Record<number, string> = {
  [TicketPriority.Low]: 'Low',
  [TicketPriority.Medium]: 'Medium',
  [TicketPriority.High]: 'High',
  [TicketPriority.Critical]: 'Critical'
};

export const TicketStatusLabels: Record<number, string> = {
  [TicketStatus.Open]: 'Open',
  [TicketStatus.Assigned]: 'Assigned',
  [TicketStatus.InProgress]: 'In Progress',
  [TicketStatus.Resolved]: 'Resolved',
  [TicketStatus.Closed]: 'Closed'
};

export const UserRoleLabels: Record<number, string> = {
  [UserRole.Employee]: 'Employee',
  [UserRole.Agent]: 'Agent',
  [UserRole.Admin]: 'Admin'
};

