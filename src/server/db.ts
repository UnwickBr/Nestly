import { randomUUID } from 'node:crypto';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Production + local dev both talk to the same NeonDB Postgres instance
// over HTTP (works in Vercel serverless functions and in a plain Node
// process, e.g. the Vite dev server). Run sql/schema.sql once against
// your database before using this.
//
// Lazily constructed (instead of at module load) because vite.config.ts
// imports this module before it has finished loading .env.local into
// process.env — by the time a query actually runs, DATABASE_URL is set.
let _sql: NeonQueryFunction<false, false> | null = null;
function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.');
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql(strings, ...values);
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  householdId: string;
  createdAt: string;
}

export interface DbInvite {
  id: string;
  fromUserId: string;
  fromHouseholdId: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt: string | null;
}

export interface DbItem {
  id: string;
  householdId: string;
  name: string;
  category: string;
  priority: string;
  status: string;
  quantity: number;
  plannedPrice: number;
  paidPrice: number | null;
  store: string;
  link: string;
  addedBy: string;
  notes: string;
  isFavorite: boolean;
  isWishlist: boolean;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbActivity {
  id: string;
  householdId: string;
  userName: string;
  action: string;
  itemName: string;
  createdAt: string;
}

const normEmail = (email: string) => email.trim().toLowerCase();

function toUser(row: any): DbUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    householdId: row.household_id,
    createdAt: row.created_at,
  };
}

function toInvite(row: any): DbInvite {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    fromHouseholdId: row.from_household_id,
    toEmail: row.to_email,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

function toItem(row: any): DbItem {
  return {
    id: row.id,
    householdId: row.household_id,
    name: row.name,
    category: row.category,
    priority: row.priority,
    status: row.status,
    quantity: row.quantity,
    plannedPrice: Number(row.planned_price),
    paidPrice: row.paid_price != null ? Number(row.paid_price) : null,
    store: row.store,
    link: row.link,
    addedBy: row.added_by,
    notes: row.notes,
    isFavorite: row.is_favorite,
    isWishlist: row.is_wishlist,
    image: row.image,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toActivity(row: any): DbActivity {
  return {
    id: row.id,
    householdId: row.household_id,
    userName: row.user_name,
    action: row.action,
    itemName: row.item_name,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await sql`select * from users where email = ${normEmail(email)}`;
  return rows[0] ? toUser(rows[0]) : null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const rows = await sql`select * from users where id = ${id}`;
  return rows[0] ? toUser(rows[0]) : null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<DbUser> {
  const householdId = randomUUID();
  await sql`insert into households (id) values (${householdId})`;

  const userId = randomUUID();
  const rows = await sql`
    insert into users (id, name, email, password_hash, household_id)
    values (${userId}, ${input.name.trim()}, ${normEmail(input.email)}, ${input.passwordHash}, ${householdId})
    returning *
  `;
  return toUser(rows[0]);
}

export async function getHouseholdMembers(householdId: string, excludeUserId?: string): Promise<DbUser[]> {
  const rows = excludeUserId
    ? await sql`select * from users where household_id = ${householdId} and id != ${excludeUserId}`
    : await sql`select * from users where household_id = ${householdId}`;
  return rows.map(toUser);
}

export async function findPendingInviteBetween(fromHouseholdId: string, toEmail: string): Promise<DbInvite | null> {
  const rows = await sql`
    select * from invites
    where from_household_id = ${fromHouseholdId} and to_email = ${normEmail(toEmail)} and status = 'pending'
    limit 1
  `;
  return rows[0] ? toInvite(rows[0]) : null;
}

export async function createInvite(input: { fromUserId: string; fromHouseholdId: string; toEmail: string }): Promise<DbInvite> {
  const id = randomUUID();
  const rows = await sql`
    insert into invites (id, from_user_id, from_household_id, to_email, status)
    values (${id}, ${input.fromUserId}, ${input.fromHouseholdId}, ${normEmail(input.toEmail)}, 'pending')
    returning *
  `;
  return toInvite(rows[0]);
}

export async function getReceivedInvites(email: string): Promise<DbInvite[]> {
  const rows = await sql`select * from invites where to_email = ${normEmail(email)} and status = 'pending'`;
  return rows.map(toInvite);
}

export async function getSentInvites(userId: string): Promise<DbInvite[]> {
  const rows = await sql`select * from invites where from_user_id = ${userId} and status = 'pending'`;
  return rows.map(toInvite);
}

export async function getInviteById(id: string): Promise<DbInvite | null> {
  const rows = await sql`select * from invites where id = ${id}`;
  return rows[0] ? toInvite(rows[0]) : null;
}

export async function resolveInvite(
  inviteId: string,
  acceptingUserId: string,
  outcome: 'accepted' | 'declined',
): Promise<{ ok: true } | { ok: false; error: string }> {
  const inviteRows = await sql`select * from invites where id = ${inviteId}`;
  const invite = inviteRows[0] ? toInvite(inviteRows[0]) : null;
  if (!invite || invite.status !== 'pending') return { ok: false, error: 'Convite não encontrado ou já respondido.' };

  const userRows = await sql`select * from users where id = ${acceptingUserId}`;
  const acceptingUser = userRows[0] ? toUser(userRows[0]) : null;
  if (!acceptingUser || acceptingUser.email !== invite.toEmail) {
    return { ok: false, error: 'Este convite não é para esta conta.' };
  }

  await sql`update invites set status = ${outcome}, responded_at = now() where id = ${inviteId}`;

  if (outcome === 'accepted') {
    await sql`update users set household_id = ${invite.fromHouseholdId} where id = ${acceptingUserId}`;
  }

  return { ok: true };
}

export interface NewItemInput {
  householdId: string;
  addedBy: string;
  name: string;
  category: string;
  priority: string;
  quantity: number;
  plannedPrice: number;
  store: string;
  link: string;
  notes: string;
  isWishlist: boolean;
  image: string;
  description: string;
}

export async function getItemsForHousehold(householdId: string): Promise<DbItem[]> {
  const rows = await sql`select * from items where household_id = ${householdId} order by created_at desc`;
  return rows.map(toItem);
}

export async function getItemById(id: string): Promise<DbItem | null> {
  const rows = await sql`select * from items where id = ${id}`;
  return rows[0] ? toItem(rows[0]) : null;
}

export async function createItem(input: NewItemInput): Promise<DbItem> {
  const id = randomUUID();
  const rows = await sql`
    insert into items (
      id, household_id, name, category, priority, quantity, planned_price,
      store, link, added_by, notes, is_wishlist, image, description
    )
    values (
      ${id}, ${input.householdId}, ${input.name}, ${input.category}, ${input.priority}, ${input.quantity},
      ${input.plannedPrice}, ${input.store}, ${input.link}, ${input.addedBy}, ${input.notes},
      ${input.isWishlist}, ${input.image}, ${input.description}
    )
    returning *
  `;
  return toItem(rows[0]);
}

export async function toggleItemFavorite(id: string): Promise<DbItem> {
  const rows = await sql`update items set is_favorite = not is_favorite, updated_at = now() where id = ${id} returning *`;
  return toItem(rows[0]);
}

export async function setItemStatus(id: string, status: string): Promise<DbItem> {
  const rows = await sql`update items set status = ${status}, updated_at = now() where id = ${id} returning *`;
  return toItem(rows[0]);
}

export async function setItemPaidPrice(id: string, paidPrice: number | null): Promise<DbItem> {
  const rows = await sql`update items set paid_price = ${paidPrice}, updated_at = now() where id = ${id} returning *`;
  return toItem(rows[0]);
}

export async function moveItemToShoppingList(id: string): Promise<DbItem> {
  const rows = await sql`update items set is_wishlist = false, updated_at = now() where id = ${id} returning *`;
  return toItem(rows[0]);
}

export async function deleteItem(id: string): Promise<void> {
  await sql`delete from items where id = ${id}`;
}

export async function logActivity(householdId: string, userName: string, action: string, itemName: string): Promise<void> {
  const id = randomUUID();
  await sql`insert into activities (id, household_id, user_name, action, item_name) values (${id}, ${householdId}, ${userName}, ${action}, ${itemName})`;
}

export async function getRecentActivities(householdId: string, limit: number): Promise<DbActivity[]> {
  const rows = await sql`select * from activities where household_id = ${householdId} order by created_at desc limit ${limit}`;
  return rows.map(toActivity);
}
