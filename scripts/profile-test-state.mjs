import fs from 'node:fs/promises';
import path from 'node:path';

import { createClient } from '@supabase/supabase-js';

const PROFILE_COLUMNS = [
  'id',
  'email',
  'subscription_tier',
  'total_credits',
  'daily_credits',
  'last_credit_reset',
  'stripe_customer_id',
  'stripe_subscription_id',
  'stripe_subscription_status',
].join(',');

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const args = { _: command };

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
}

function requireWriteConfirmation(args) {
  if (!args['confirm-write']) {
    throw new Error('Refusing to mutate profile state without --confirm-write.');
  }
}

function resolveSelector(args, snapshot) {
  const userId = args['user-id'] || snapshot?.profile?.id;
  const email = args.email || snapshot?.profile?.email;

  if (!userId && !email) {
    throw new Error('Provide --user-id or --email, or use --snapshot with a stored profile.');
  }

  return { userId, email };
}

async function readSnapshot(snapshotPath) {
  const absolutePath = path.resolve(snapshotPath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  const snapshot = JSON.parse(raw);
  return { absolutePath, snapshot };
}

async function fetchProfile(supabase, selector) {
  let query = supabase.from('profiles').select(PROFILE_COLUMNS);

  if (selector.userId) {
    query = query.eq('id', selector.userId);
  } else {
    query = query.eq('email', selector.email);
  }

  const { data, error } = await query.single();
  if (error || !data) {
    throw new Error(`Unable to load profile: ${error?.message || 'not found'}`);
  }

  return data;
}

async function writeSnapshot(filePath, payload) {
  const absolutePath = path.resolve(filePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return absolutePath;
}

function buildApplyUpdate(args) {
  const update = {};

  if (args.tier) {
    update.subscription_tier = args.tier;
  }
  if (args['total-credits'] !== undefined) {
    update.total_credits = Number(args['total-credits']);
  }
  if (args['daily-credits'] !== undefined) {
    update.daily_credits = Number(args['daily-credits']);
  }
  if (args['last-credit-reset']) {
    update.last_credit_reset = args['last-credit-reset'];
  }
  if (args['stripe-status']) {
    update.stripe_subscription_status = args['stripe-status'];
  }

  if (Object.keys(update).length === 0) {
    throw new Error('No changes requested. Use --tier, --total-credits, --daily-credits, --last-credit-reset, or --stripe-status.');
  }

  return update;
}

async function updateProfile(supabase, userId, update) {
  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message || 'unknown error'}`);
  }

  return data;
}

function printProfile(profile, label) {
  console.log(`${label}:`);
  console.log(JSON.stringify(profile, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._;

  if (!command || !['show', 'snapshot', 'apply', 'restore'].includes(command)) {
    throw new Error(
      'Usage: node scripts/profile-test-state.mjs <show|snapshot|apply|restore> [--email user@example.com | --user-id <uuid>] [--snapshot <file>] [--confirm-write]',
    );
  }

  const supabase = createClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const snapshotBundle = args.snapshot ? await readSnapshot(args.snapshot) : null;
  const selector = resolveSelector(args, snapshotBundle?.snapshot);
  const profile = await fetchProfile(supabase, selector);

  if (command === 'show') {
    printProfile(profile, 'Current profile');
    return;
  }

  if (command === 'snapshot') {
    const outputPath =
      args.out ||
      path.join('output', 'qa', `${profile.email.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-profile-snapshot.json`);

    const snapshotPayload = {
      capturedAt: new Date().toISOString(),
      selector,
      profile,
    };

    const writtenPath = await writeSnapshot(outputPath, snapshotPayload);
    console.log(`Snapshot written to ${writtenPath}`);
    printProfile(profile, 'Snapshotted profile');
    return;
  }

  requireWriteConfirmation(args);

  if (command === 'apply') {
    const update = buildApplyUpdate(args);
    const updatedProfile = await updateProfile(supabase, profile.id, update);
    printProfile(profile, 'Profile before apply');
    printProfile(updatedProfile, 'Profile after apply');
    return;
  }

  if (command === 'restore') {
    if (!snapshotBundle?.snapshot?.profile) {
      throw new Error('Restore requires --snapshot <file>.');
    }

    const restoreSource = snapshotBundle.snapshot.profile;
    const update = {
      subscription_tier: restoreSource.subscription_tier,
      total_credits: restoreSource.total_credits,
      daily_credits: restoreSource.daily_credits,
      last_credit_reset: restoreSource.last_credit_reset,
      stripe_subscription_status: restoreSource.stripe_subscription_status,
      stripe_customer_id: restoreSource.stripe_customer_id,
      stripe_subscription_id: restoreSource.stripe_subscription_id,
    };

    const restoredProfile = await updateProfile(supabase, profile.id, update);
    printProfile(profile, 'Profile before restore');
    printProfile(restoredProfile, 'Profile after restore');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
