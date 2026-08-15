# Username + Password Setup

The app now asks users only for:

- Username
- Password
- Optional display name during signup

## Required Supabase setting

In Supabase Dashboard:

Authentication
→ Providers
→ Email
→ turn OFF `Confirm Email`

Keep Email/Password authentication itself enabled.

Supabase password authentication requires an email or phone identifier internally, so First Dice automatically maps:

username

to:

username@users.firstdice.invalid

The user never sees that internal value.

## Existing development accounts

Accounts previously created using real email addresses will not log in with this new username flow. Recreate them for development, or migrate their Auth identities separately.

## Password recovery

Because users do not provide a real email address, normal email-based password reset is unavailable. Add an admin recovery flow or another verified identity method before using this for accounts where password recovery is important.
