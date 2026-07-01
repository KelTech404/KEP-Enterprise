Build a web app called " Business Management Center" with three zones, connected to an existing Supabase project (I will provide the URL and anon key).

## **VISUAL DESIGN SYSTEM (apply throughout)**

* Primary color: deep trust-blue `#1E5A8C` (headers, navigation, primary buttons)  
* Secondary color: warm teal `#2E8B82` (active tab states, secondary highlights)  
* Accent color: warm gold `#D4942E` (call-to-action buttons, notification badges, important alerts)  
* Background: warm off-white `#F7F4EE` (not stark white)  
* Text: charcoal `#2B2B2B` (not pure black)  
* Success/confirmation states: soft sage green `#6B9080`  
* Overall feel: professional nonprofit/community-services tool — warm, trustworthy, calm. Not corporate-cold, not flashy or startup-bright.  
* Typography: clean sans-serif, generous line height, no condensed fonts  
* Public-facing screens: large text (minimum 18px body), large tap targets (minimum 48px height), high contrast, no jargon in labels — designed for older adult users with limited tech experience  
* Staff-facing screens: denser, standard professional dashboard layout, data-forward

## **ZONE 1 — PUBLIC SUBMISSION (no login required)**

"AP Ambassador Monthly Report" form, sectioned with clear group headers:

**Section: Your Information**

* Ambassador (dropdown, populated live from the `ambassador_contacts` table by `ambassador_name` — on selection, store the corresponding `ambassador_id`, not the name itself)  
* Reporting month (month/year picker)

**Section: Seniors Served**

* Seniors served this month (number)  
* First-time seniors served this month (number)

**Section: Activities to Combat Social Isolation** (multi-select checkboxes, plus an "Other" text field that only appears if "Other" is checked)

* Technology Assistance  
* Check-In phone calls or Visits  
* Group Activities (Book Clubs, Bible Study, Outings, Social Gatherings)  
* Transportation  
* Mental Wellness Activities  
* Other

**Section: Activities to Support Independent Living** (multi-select checkboxes, plus conditional "Other" text field)

* Assistance with Housing  
* COVID Vaccination and Testing  
* Food Support/Meals  
* Groceries/Shopping/Errands  
* Personal Hygiene Support  
* Safe-at-Home (Home Safety Adaptations)  
* Wellness/Fitness Activities  
* Wellness Support  
* Other

**Section: Referrals to Supportive Services** (multi-select checkboxes, plus conditional "Other" text field)

* Assistance with applications (SNAP, Energy Assistance, Medicare)  
* Referral for Home Healthcare Aide  
* Referral to Legal Aid  
* Referral to a Village  
* Referral to DACL  
* Assistance with EDP Waiver  
* Provided General Information  
* Wellness/Fitness Activities  
* Wellness Support  
* Other

**Section: Benefits & Resources**

* Seniors assisted with benefits enrollment/recertification (number)  
* Additional resources that would help support seniors (text area)

**Section: Senior Villages**

* Connected a senior with a Senior Village this period? (Yes/No toggle)  
* If Yes → reveal: how many (number), which village(s) (dropdown — PLACEHOLDER options for now, clearly marked in code as a placeholder block)

**Section: Requests & Follow-up**

* Any requests unable to be fulfilled? (Yes/No toggle)  
* If Yes → reveal: explanation (text area)  
* Seniors referred for follow-up support (number)  
* Request a support call with the KCV Director? (Yes/No toggle)

**Section: Wrap-up**

* Highlight or significant activity for the month (text area)  
* Project concerns / recommendations for improvement (text area)

**On submit:**

* Insert a row into `aip_monthly_reports` using the anon key, with `ambassador_id` as a foreign key reference (no church/pastor/ward/phone typed manually — those are pulled via the `ambassador_id` join, never re-entered)  
* Show a clear, warm confirmation screen on success (use the sage green `#6B9080` success state)

## **ZONE 2 — STAFF DASHBOARD (AUTHENTICATION REQUIRED — hard requirement, not optional)**

* Supabase Auth login screen (email \+ password) is the FIRST thing any staff user sees — no dashboard content, stats, or data of any kind renders before a successful login  
* Session must persist appropriately (standard Supabase session handling) but must redirect to the login screen if the session is invalid or expired  
* Logout action clearly visible in the dashboard navigation at all times

**After successful login:**

* Header: "K Enterprise Business Management Center"  
* Tab switcher: AP, KCV, KCV-KCV-K-H, Gateway (Afterschool)

**AP tab** (pulling live from `aip_monthly_reports` joined to `ambassador_contacts`):

* Six stat cards across the top: submissions today, total seniors served, total first-time seniors served, total benefits assistance, total seniors connected to villages, total referred for follow-up  
* "Ambassador Followup Request Received" panel — lists any report where `unfulfilled_requests` is true or `requested_director_call` is true, showing the Ambassador's name and Church (joined from `ambassador_contacts`)  
* Recent submissions list, showing Ambassador name \+ Church (joined, not duplicated/stored redundantly on the report row)  
* A notification badge on the AP tab itself showing the count of pending follow-up items, visible even before clicking into the tab

**KCV, KCV-KCV-K-H, and Gateway tabs:**

* Show a "Phase 2 — coming soon" placeholder state, styled consistently with the rest of the dashboard

## **ZONE 3 — NEW AMBASSADOR SETUP (staff-only, requires the same authenticated session as Zone 2 — no separate or weaker auth path)**

* Accessible via a "+ New Ambassador" button in the staff dashboard navigation  
* Form fields: Ambassador Name, Church (dropdown — PLACEHOLDER list of 14 churches, clearly marked in code for later replacement), Pastor, Ward, Phone, Email (must be unique)  
* On submit: insert into `ambassador_contacts` using the authenticated session (Row Level Security restricts this insert to logged-in staff only)  
* Clear save/cancel actions and a success state on save  
* New Ambassador becomes immediately available in the Zone 1 submission form dropdown

## **SECURITY REQUIREMENTS (non-negotiable)**

* Row Level Security (RLS) as configured in Supabase must be respected — do not write code that bypasses RLS or uses a service role key anywhere in client-side/frontend code  
* The anon key is the only Supabase key ever used in frontend code  
* No Ambassador contact data, staff data, or report data should ever be readable without an authenticated session  
* `ambassador_contacts` table: anon has zero access (no read, no write); only authenticated staff can read or create records  
* `aip_monthly_reports` table: anon can insert only (the public form); only authenticated staff can read

## **DATA HANDLING**

* Never hardcode real names, real church names, or real personal information anywhere in the app  
* Use generic placeholder values only during development (e.g. "Church A," "Jane B") — clearly marked in code as placeholder blocks so they're easy to find and replace once real lists are provided

