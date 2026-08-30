/**
 * The resource registry.
 *
 * Every dashboard screen is generated from these definitions: the nav, the list
 * table, the filters, the form, and which fields are editable. One place to
 * change when a model changes, rather than fourteen sets of near-identical
 * pages that drift apart.
 *
 * `key` matches both the API route segment and the name used in the ABAC
 * policy, so a permission check is always about the same string the user sees
 * in the URL.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'select'
  | 'boolean'
  | 'upload'
  | 'list'
  | 'readonly';

export type Field = {
  name: string;
  /** Options come from the countries table rather than this file. */
  source?:
    | 'country'
    | 'currency'
    | 'countryId'
    | 'office'
    | 'document'
    | 'staff'
    | 'project'
    | 'scholarship';
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  help?: string;
  /** upload fields only: which folder in object storage to put the file in. */
  folder?: string;
  /** list fields only: the shape of one row. */
  itemFields?: { name: string; label: string; type?: 'text' | 'textarea' }[];
  /** list fields only: wording for the add button. */
  addLabel?: string;
  /** Full width in the two-column form grid. */
  wide?: boolean;
  required?: boolean;
};

export type Column = {
  name: string;
  label: string;
  /** Render as a status pill rather than plain text. */
  badge?: boolean;
  /** Format as a date-time. */
  date?: boolean;
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
  /**
   * Render the value as a small thumbnail. Images show as a picture, files
   * (a PDF newsletter, a handbook) as a labelled chip — the value is a URL and
   * not every record's artwork is an image.
   */
  thumb?: boolean;
  className?: string;
};

export type Resource = {
  key: string;
  label: string;
  singular: string;
  group: 'Inbox' | 'Giving' | 'Programmes' | 'Website' | 'Operations' | 'Access';
  /**
   * Nests this resource under a named, expandable sidebar row alongside its
   * siblings — the way Newsletters and Subscribers are two halves of one job.
   * It changes navigation only; routes and permissions are unaffected.
   */
  parent?: string;
  icon: string;
  description?: string;
  columns: Column[];
  fields: Field[];
  filters?: Field[];
  searchHint?: string;
  /** A record of what someone sent — creating one by hand makes no sense. */
  noCreate?: boolean;
  /**
   * Written by the application, never by a person. Its detail page is shown as
   * a record rather than as a form nobody may submit, and it offers no create.
   */
  readOnly?: boolean;
  titleField?: string;
};

/**
 * Filled in at render time from the operating-countries table, so adding a
 * country is a row in the dashboard rather than an edit here. `DYNAMIC` marks
 * the fields that get substituted; see `withOptions` below.
 */
export const DYNAMIC = { country: 'country', currency: 'currency' } as const;

const COUNTRY_OPTIONS: { value: string; label: string }[] = [];
const CURRENCY_OPTIONS: { value: string; label: string }[] = [];

const TRIAGE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
  { value: 'spam', label: 'Spam' },
];

const INTEREST_OPTIONS = [
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'event', label: 'Event organization' },
  { value: 'tutoring', label: 'STEM tutoring' },
  { value: 'outreach', label: 'Community outreach' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_OPTIONS = [
  { value: 'physical', label: 'Physical Sciences' },
  { value: 'life', label: 'Life & Environmental Sciences' },
  { value: 'engineering', label: 'Engineering & Technology' },
  { value: 'software', label: 'Computer Science & Software' },
  { value: 'innovation', label: 'Innovation & Entrepreneurship' },
  { value: 'community', label: 'Community & Social Impact' },
];

/** The eight stages published on /secondary-research, in order. */
const STAGE_OPTIONS = [
  { value: 'handbook_released', label: '1. Handbook released to schools' },
  { value: 'project_chosen', label: '2. Choose a project, find a mentor' },
  { value: 'proposal_submitted', label: '3. Submit your proposal' },
  { value: 'under_review', label: '4. Review and feedback' },
  { value: 'research_and_build', label: '5. Research and build' },
  { value: 'school_fair', label: '6. School-level fair' },
  { value: 'regional_fair', label: '7. Regional fair' },
  { value: 'national_fair', label: '8. National fair' },
];

const triageFields: Field[] = [
  { name: 'status', label: 'Status', type: 'select', options: TRIAGE_OPTIONS },
  { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
  { name: 'office', label: 'Office', type: 'select', options: [], source: 'office', help: 'Narrows to the chosen country.' },
  { name: 'staff_notes', label: 'Internal notes', type: 'textarea', wide: true, help: 'Never shown on the website.' },
];

export const RESOURCES: Resource[] = [
  {
    key: 'volunteers',
    label: 'Applications',
    parent: 'Volunteers',
    singular: 'volunteer application',
    group: 'Inbox',
    icon: 'UserPlus',
    description: 'People offering time through the volunteer form.',
    titleField: 'name',
    noCreate: true,
    searchHint: 'name, email, phone, message',
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email' },
      { name: 'interest_display', label: 'Interest' },
      { name: 'country', label: 'Country' },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'created_at', label: 'Received', date: true },
    ],
    filters: [
      { name: 'status', label: 'Status', type: 'select', options: TRIAGE_OPTIONS },
      { name: 'interest', label: 'Interest', type: 'select', options: INTEREST_OPTIONS },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'readonly' },
      { name: 'email', label: 'Email', type: 'readonly' },
      { name: 'phone', label: 'Phone', type: 'readonly' },
      { name: 'interest_display', label: 'Area of interest', type: 'readonly' },
      { name: 'message', label: 'Why they want to volunteer', type: 'readonly', wide: true },
      ...triageFields,
    ],
  },
  {
    key: 'recognised-volunteers',
    label: 'Recognised',
    singular: 'volunteer',
    group: 'Inbox',
    parent: 'Volunteers',
    icon: 'Award',
    description:
      'Volunteers named on the volunteers page. Kept apart from the team, who are staff — these are people who gave their time.',
    titleField: 'name',
    searchHint: 'name, role, note',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'name', label: 'Volunteer' },
      { name: 'role', label: 'What they did' },
      { name: 'order', label: 'Order', numeric: true },
      { name: 'is_published', label: 'Shown' },
    ],
    filters: [
      {
        name: 'is_published', label: 'Shown', type: 'select',
        options: [
          { value: 'true', label: 'Shown' },
          { value: 'false', label: 'Hidden' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, wide: true },
      { name: 'role', label: 'What they did', type: 'text', required: true, wide: true, help: 'e.g. STEM tutoring, or Science fair judge.' },
      { name: 'image', label: 'Photograph', type: 'upload', folder: 'team', wide: true },
      { name: 'alt', label: 'Photograph alt text', type: 'text', wide: true },
      { name: 'bio', label: 'Why they are recognised', type: 'textarea', wide: true },
      { name: 'linkedin', label: 'LinkedIn', type: 'text' },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'is_published', label: 'Shown on the volunteers page', type: 'boolean' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    singular: 'project',
    group: 'Programmes',
    parent: 'Student projects',
    icon: 'FlaskConical',
    description:
      'A student project from proposal through to completion. The stage is the record of where it has got to.',
    titleField: 'title',
    searchHint: 'title, school, mentor',
    columns: [
      { name: 'title', label: 'Project' },
      { name: 'school', label: 'School' },
      { name: 'stage_display', label: 'Stage', badge: true },
      { name: 'award_count', label: 'Awards', numeric: true },
      { name: 'country', label: 'Country' },
    ],
    filters: [
      { name: 'stage', label: 'Stage', type: 'select',
        options: [
          { value: 'handbook_released', label: '1. Handbook released' },
          { value: 'project_chosen', label: '2. Project chosen' },
          { value: 'proposal_submitted', label: '3. Proposal submitted' },
          { value: 'under_review', label: '4. Review and feedback' },
          { value: 'research_and_build', label: '5. Research and build' },
          { value: 'school_fair', label: '6. School fair' },
          { value: 'regional_fair', label: '7. Regional fair' },
          { value: 'national_fair', label: '8. National fair' },
          { value: 'completed', label: '9. Completed' },
          { value: 'withdrawn', label: 'Withdrawn' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'title', label: 'Project title', type: 'text', required: true, wide: true },
      { name: 'school', label: 'School', type: 'text', required: true },
      { name: 'district', label: 'District', type: 'text' },
      { name: 'teacher_mentor', label: 'Teacher or mentor', type: 'text' },
      { name: 'stage', label: 'Stage', type: 'select', required: true,
        options: [
          { value: 'handbook_released', label: '1. Handbook released' },
          { value: 'project_chosen', label: '2. Project chosen' },
          { value: 'proposal_submitted', label: '3. Proposal submitted' },
          { value: 'under_review', label: '4. Review and feedback' },
          { value: 'research_and_build', label: '5. Research and build' },
          { value: 'school_fair', label: '6. School fair' },
          { value: 'regional_fair', label: '7. Regional fair' },
          { value: 'national_fair', label: '8. National fair' },
          { value: 'completed', label: '9. Completed' },
          { value: 'withdrawn', label: 'Withdrawn' },
        ],
      },
      { name: 'review_score', label: 'Review score', type: 'number' },
      { name: 'review_feedback', label: 'Review feedback', type: 'textarea', wide: true },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'project-awards',
    label: 'Awards & benefits',
    singular: 'award',
    group: 'Programmes',
    parent: 'Student projects',
    icon: 'Trophy',
    description:
      'What students received for their work — placements, prizes, scholarships, equipment. Recorded per award, because one project often earns several.',
    titleField: 'title',
    searchHint: 'award, project, who gave it',
    columns: [
      { name: 'title', label: 'Award' },
      { name: 'kind_display', label: 'Kind', badge: true },
      { name: 'project_title', label: 'Project' },
      { name: 'awarded_on', label: 'Awarded' },
      { name: 'is_delivered', label: 'Received' },
    ],
    filters: [
      { name: 'kind', label: 'Kind', type: 'select',
        options: [
          { value: 'placement', label: 'Placement at a fair' },
          { value: 'prize', label: 'Prize' },
          { value: 'scholarship', label: 'Scholarship' },
          { value: 'equipment', label: 'Equipment' },
          { value: 'certificate', label: 'Certificate' },
          { value: 'mentorship', label: 'Mentorship place' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        name: 'is_delivered', label: 'Received', type: 'select',
        options: [
          { value: 'true', label: 'Received' },
          { value: 'false', label: 'Promised, not yet received' },
        ],
      },
    ],
    fields: [
      { name: 'project', label: 'Project', type: 'select', options: [], source: 'project', required: true },
      { name: 'kind', label: 'Kind', type: 'select', required: true,
        options: [
          { value: 'placement', label: 'Placement at a fair' },
          { value: 'prize', label: 'Prize' },
          { value: 'scholarship', label: 'Scholarship' },
          { value: 'equipment', label: 'Equipment' },
          { value: 'certificate', label: 'Certificate' },
          { value: 'mentorship', label: 'Mentorship place' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'title', label: 'Award', type: 'text', required: true, wide: true, help: 'e.g. First place, regional fair.' },
      { name: 'description', label: 'Description', type: 'textarea', wide: true },
      { name: 'amount', label: 'Amount', type: 'number', help: 'Only if it carries money.' },
      { name: 'currency', label: 'Currency', type: 'select', options: [], source: 'currency', help: 'Required when there is an amount.' },
      { name: 'awarded_by', label: 'Given by', type: 'text', help: 'The Foundation, a partner, a sponsor.' },
      { name: 'awarded_on', label: 'Awarded on', type: 'date' },
      { name: 'is_delivered', label: 'The student has received it', type: 'boolean', help: 'A scholarship promised and a scholarship paid are different facts.' },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
  },
  {
    key: 'contact-messages',
    label: 'Contact messages',
    singular: 'contact message',
    group: 'Inbox',
    icon: 'Mail',
    titleField: 'name',
    noCreate: true,
    searchHint: 'name, email, topic, message',
    columns: [
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email' },
      { name: 'topic', label: 'Topic' },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'created_at', label: 'Received', date: true },
    ],
    filters: [{ name: 'status', label: 'Status', type: 'select', options: TRIAGE_OPTIONS }],
    fields: [
      { name: 'name', label: 'Name', type: 'readonly' },
      { name: 'email', label: 'Email', type: 'readonly' },
      { name: 'topic', label: 'Topic', type: 'readonly' },
      { name: 'message', label: 'Message', type: 'readonly', wide: true },
      ...triageFields,
    ],
  },
  {
    key: 'proposals',
    label: 'Applications',
    parent: 'Student projects',
    singular: 'registration',
    // Moved out of the Inbox so the whole lifecycle — application, project,
    // award — sits under one heading rather than starting in a different one.
    group: 'Programmes',
    icon: 'FlaskConical',
    titleField: 'project_title',
    noCreate: true,
    searchHint: 'project, student, school, mentor',
    columns: [
      { name: 'project_title', label: 'Project' },
      { name: 'student_name', label: 'Student' },
      { name: 'school', label: 'School' },
      { name: 'district', label: 'District' },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'created_at', label: 'Received', date: true },
    ],
    filters: [
      { name: 'status', label: 'Status', type: 'select', options: TRIAGE_OPTIONS },
      { name: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS },
    ],
    fields: [
      { name: 'student_name', label: 'Student', type: 'readonly' },
      { name: 'gender', label: 'Gender', type: 'readonly' },
      { name: 'age', label: 'Age', type: 'readonly' },
      { name: 'class_stream', label: 'Class / stream', type: 'readonly' },
      { name: 'school', label: 'School', type: 'readonly' },
      { name: 'district', label: 'District', type: 'readonly' },
      { name: 'region', label: 'Region', type: 'readonly' },
      { name: 'student_email', label: 'Student email', type: 'readonly' },
      { name: 'student_phone', label: 'Student phone', type: 'readonly' },
      { name: 'guardian_contact', label: 'Guardian contact', type: 'readonly' },
      { name: 'teacher_mentor', label: 'Teacher mentor', type: 'readonly' },
      { name: 'head_teacher', label: 'Head teacher', type: 'readonly' },
      { name: 'project_title', label: 'Project title', type: 'readonly', wide: true },
      { name: 'category_display', label: 'Category', type: 'readonly', wide: true },
      { name: 'project_type', label: 'Project type', type: 'readonly', wide: true },
      { name: 'keywords', label: 'Keywords', type: 'readonly' },
      { name: 'duration', label: 'Estimated duration', type: 'readonly' },
      { name: 'team_size', label: 'Individual or team', type: 'readonly' },
      { name: 'summary', label: 'The problem', type: 'readonly', wide: true },
      { name: 'declaration', label: 'Declaration confirmed', type: 'readonly' },
      ...triageFields,
    ],
  },
  {
    key: 'subscribers',
    label: 'Subscribers',
    singular: 'subscriber',
    group: 'Website',
    parent: 'Newsletter',
    icon: 'AtSign',
    titleField: 'email',
    searchHint: 'email, source',
    columns: [
      { name: 'email', label: 'Email' },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'source', label: 'Source' },
      { name: 'created_at', label: 'Signed up', date: true },
    ],
    filters: [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'subscribed', label: 'Subscribed' },
          { value: 'unsubscribed', label: 'Unsubscribed' },
          { value: 'bounced', label: 'Bounced' },
        ],
      },
    ],
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'subscribed', label: 'Subscribed' },
          { value: 'unsubscribed', label: 'Unsubscribed' },
          { value: 'bounced', label: 'Bounced' },
        ],
      },
      { name: 'source', label: 'Source', type: 'text' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
      { name: 'unsubscribed_at', label: 'Unsubscribed on', type: 'readonly' },
    ],
  },
  {
    key: 'donations',
    label: 'Donations & gifts',
    parent: 'Fundraising',
    singular: 'gift',
    group: 'Giving',
    icon: 'HeartHandshake',
    description:
      'Every gift, however it arrived. Card payments are mirrored from Stripe and cannot be edited here; a cheque, transfer, pledge or gift in kind is recorded by hand.',
    titleField: 'donor_name',
    searchHint: 'donor name, email, designation, Stripe id',
    columns: [
      { name: 'received_on', label: 'Received', date: true },
      { name: 'donor_name', label: 'Donor' },
      { name: 'amount_display', label: 'Amount', numeric: true },
      { name: 'gift_type_display', label: 'Kind' },
      { name: 'source_display', label: 'Recorded' },
      { name: 'status_display', label: 'Status', badge: true },
    ],
    filters: [
      {
        name: 'source', label: 'How it arrived', type: 'select',
        options: [
          { value: 'online', label: 'Online (Stripe)' },
          { value: 'offline', label: 'Recorded by hand' },
        ],
      },
      {
        name: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'received', label: 'Received' },
          { value: 'succeeded', label: 'Succeeded' },
          { value: 'pledged', label: 'Pledged' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' },
        ],
      },
      {
        name: 'gift_type', label: 'Kind', type: 'select',
        options: [
          { value: 'one_off', label: 'One-off gift' },
          { value: 'recurring', label: 'Recurring gift' },
          { value: 'pledge', label: 'Pledge' },
          { value: 'in_kind', label: 'In kind' },
          { value: 'grant', label: 'Grant' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'donor_name', label: 'Donor', type: 'text', wide: true },
      { name: 'donor_email', label: 'Email', type: 'email', wide: true },
      { name: 'amount_major', label: 'Amount', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'select', options: CURRENCY_OPTIONS, source: 'currency' },
      { name: 'received_on', label: 'Received on', type: 'date', help: 'When the money arrived, not when it was typed in.' },
      {
        name: 'gift_type', label: 'Kind of gift', type: 'select',
        options: [
          { value: 'one_off', label: 'One-off gift' },
          { value: 'recurring', label: 'Recurring gift' },
          { value: 'pledge', label: 'Pledge' },
          { value: 'in_kind', label: 'In kind' },
          { value: 'grant', label: 'Grant' },
        ],
      },
      {
        name: 'status', label: 'Status', type: 'select',
        help: 'A pledge is a promise and is not counted until it is received.',
        options: [
          { value: 'received', label: 'Received' },
          { value: 'pledged', label: 'Pledged' },
          { value: 'refunded', label: 'Refunded' },
        ],
      },
      {
        name: 'payment_method', label: 'How it was paid', type: 'select',
        options: [
          { value: '', label: 'Not recorded' },
          { value: 'bank', label: 'Bank transfer' },
          { value: 'mobile', label: 'Mobile money' },
          { value: 'cheque', label: 'Cheque' },
          { value: 'cash', label: 'Cash' },
          { value: 'card', label: 'Card' },
          { value: 'in_kind', label: 'In kind' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'designation', label: 'What it is for', type: 'text', wide: true, help: 'Blank means unrestricted.' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country', help: 'Which office it is credited to.' },
      {
        name: 'receipt_status', label: 'Receipt', type: 'select',
        options: [
          { value: 'not_sent', label: 'Not sent' },
          { value: 'sent', label: 'Sent' },
          { value: 'not_required', label: 'Not required' },
        ],
      },
      { name: 'receipt_sent_on', label: 'Receipt sent on', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },

      // Stripe's own record. Shown so a card gift can be traced, never edited:
      // changing it here would leave a total that disagrees with the processor.
      { name: 'source_display', label: 'How it arrived', type: 'readonly' },
      { name: 'recorded_by_name', label: 'Recorded by', type: 'readonly' },
      { name: 'amount_display', label: 'Amount as stored', type: 'readonly' },
      { name: 'livemode', label: 'Live mode', type: 'readonly' },
      { name: 'stripe_session_id', label: 'Stripe session', type: 'readonly', wide: true },
      { name: 'stripe_payment_intent', label: 'Payment intent', type: 'readonly', wide: true },
      { name: 'receipt_url', label: 'Stripe receipt', type: 'readonly', wide: true },
      { name: 'created_at', label: 'Entered', type: 'readonly' },
    ],
  },
  {
    key: 'programmes',
    label: 'Programmes',
    singular: 'programme',
    group: 'Website',
    icon: 'GraduationCap',
    description:
      'The programme cards and the pathway strip on /programs. The long-form pages keep their own layouts.',
    titleField: 'name',
    searchHint: 'name, tagline, summary',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'name', label: 'Programme' },
      { name: 'tagline', label: 'Tagline' },
      { name: 'pathway_stage', label: 'Pathway stage' },
      { name: 'order', label: 'Order', numeric: true },
      { name: 'is_published', label: 'Published' },
    ],
    filters: [
      {
        name: 'is_published',
        label: 'Published',
        type: 'select',
        options: [
          { value: 'true', label: 'Published' },
          { value: 'false', label: 'Hidden' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'name', label: 'Programme name', type: 'text', required: true, wide: true },
      { name: 'slug', label: 'Slug', type: 'text', help: 'Left blank, it is made from the name.' },
      { name: 'tagline', label: 'Tagline', type: 'text', wide: true, help: 'The short line under the title on the card.' },
      { name: 'summary', label: 'Card text', type: 'textarea', wide: true, required: true, help: 'One or two sentences.' },
      { name: 'href', label: 'Links to', type: 'text', help: 'e.g. /youth-stem. Blank if it has no page yet.' },
      { name: 'image', label: 'Card image', type: 'upload', folder: 'programmes', wide: true, help: 'Upload one, or type a path already under /public.' },
      { name: 'image_alt', label: 'Image alt text', type: 'text', wide: true },
      { name: 'icon', label: 'Icon', type: 'text', help: 'e.g. users, globe, book-open, award.' },
      { name: 'pathway_stage', label: 'Pathway stage', type: 'text', help: 'e.g. Inspire. Blank keeps it out of the pathway strip.' },
      { name: 'pathway_label', label: 'Pathway name', type: 'text', help: 'Shown in the pathway strip. Defaults to the programme name.' },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'is_published', label: 'Published', type: 'boolean' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'page-blocks',
    label: 'Page copy',
    singular: 'block',
    group: 'Website',
    icon: 'FileText',
    description:
      'Wording on the hand-built pages — About, Impact, Uganda, South Sudan. Layout stays in the design; only the words are edited here. Unpublish a block to fall back to the built-in text.',
    titleField: 'key',
    searchHint: 'page, key, text',
    columns: [
      { name: 'page', label: 'Page' },
      { name: 'label', label: 'What it is' },
      { name: 'key', label: 'Key' },
      { name: 'is_published', label: 'In use' },
    ],
    filters: [
      { name: 'page', label: 'Page', type: 'text' },
      {
        name: 'is_published',
        label: 'In use',
        type: 'select',
        options: [
          { value: 'true', label: 'In use' },
          { value: 'false', label: 'Falling back' },
        ],
      },
    ],
    fields: [
      { name: 'page', label: 'Page', type: 'text', required: true, help: 'e.g. about, uganda, impact.' },
      { name: 'key', label: 'Key', type: 'text', required: true, help: 'Which piece of the page, e.g. hero.heading. Must match the page.' },
      { name: 'label', label: 'What it is', type: 'text', wide: true, help: 'Plain words, for whoever edits it next.' },
      { name: 'value', label: 'Text', type: 'textarea', wide: true },
      { name: 'is_published', label: 'In use', type: 'boolean', help: 'Off falls back to the text built into the page.' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'job-postings',
    label: 'Positions',
    singular: 'position',
    group: 'Website',
    parent: 'Hiring',
    icon: 'Briefcase',
    description:
      'Vacancies on the careers page. Closing a position takes it off the site; it is never deleted, because applications on file refer to it.',
    titleField: 'title',
    searchHint: 'title, summary',
    columns: [
      { name: 'title', label: 'Position' },
      { name: 'employment_type_display', label: 'Type' },
      { name: 'office_name', label: 'Office' },
      { name: 'application_count', label: 'Applications', numeric: true },
      { name: 'is_open', label: 'Open' },
    ],
    filters: [
      {
        name: 'is_open', label: 'Open', type: 'select',
        options: [
          { value: 'true', label: 'Open' },
          { value: 'false', label: 'Closed' },
        ],
      },
      { name: 'employment_type', label: 'Type', type: 'select',
        options: [
          { value: 'full_time', label: 'Full time' },
          { value: 'part_time', label: 'Part time' },
          { value: 'contract', label: 'Contract' },
          { value: 'internship', label: 'Internship' },
          { value: 'volunteer', label: 'Volunteer' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'title', label: 'Job title', type: 'text', required: true, wide: true },
      { name: 'slug', label: 'Slug', type: 'text', help: 'Left blank, it is made from the title.' },
      { name: 'employment_type', label: 'Employment type', type: 'select', required: true,
        options: [
          { value: 'full_time', label: 'Full time' },
          { value: 'part_time', label: 'Part time' },
          { value: 'contract', label: 'Contract' },
          { value: 'internship', label: 'Internship' },
          { value: 'volunteer', label: 'Volunteer' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
      { name: 'office', label: 'Office', type: 'select', options: [], source: 'office', help: 'Narrows to the chosen country.' },
      { name: 'summary', label: 'Summary', type: 'textarea', wide: true, required: true, help: 'One or two sentences. This is the card on the careers page.' },
      { name: 'description', label: 'Full description', type: 'textarea', wide: true },
      { name: 'responsibilities', label: 'What the role involves', type: 'textarea', wide: true, help: 'One per line. Shown as a list.' },
      { name: 'requirements', label: 'What we are looking for', type: 'textarea', wide: true, help: 'One per line. Shown as a list.' },
      { name: 'posted_on', label: 'Posted on', type: 'date' },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'is_open', label: 'Open — shown on the careers page', type: 'boolean' },
    ],
  },
  {
    key: 'job-applications',
    label: 'Applications',
    singular: 'application',
    group: 'Website',
    parent: 'Hiring',
    icon: 'UserSearch',
    description:
      'Everyone who has applied, and how far they have got. Every stage change is recorded in the activity log.',
    titleField: 'name',
    searchHint: 'name, email, position',
    columns: [
      { name: 'name', label: 'Applicant' },
      { name: 'posting_title', label: 'Position' },
      { name: 'stage_display', label: 'Stage', badge: true },
      { name: 'email', label: 'Email' },
      { name: 'created_at', label: 'Applied', date: true },
    ],
    filters: [
      { name: 'stage', label: 'Stage', type: 'select',
        options: [
          { value: 'new', label: 'New' },
          { value: 'screening', label: 'Screening' },
          { value: 'interview', label: 'Interview' },
          { value: 'offer', label: 'Offer' },
          { value: 'hired', label: 'Hired' },
          { value: 'rejected', label: 'Not taken forward' },
          { value: 'withdrawn', label: 'Withdrawn' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'name', label: 'Applicant', type: 'text', required: true, wide: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'posting_title', label: 'Applied for', type: 'readonly', wide: true },
      { name: 'stage', label: 'Stage', type: 'select', required: true,
        options: [
          { value: 'new', label: 'New' },
          { value: 'screening', label: 'Screening' },
          { value: 'interview', label: 'Interview' },
          { value: 'offer', label: 'Offer' },
          { value: 'hired', label: 'Hired' },
          { value: 'rejected', label: 'Not taken forward' },
          { value: 'withdrawn', label: 'Withdrawn' },
        ],
      },
      { name: 'cv', label: 'CV', type: 'upload', folder: 'cv', wide: true },
      { name: 'cover_letter', label: 'Covering letter', type: 'textarea', wide: true },
      { name: 'notes', label: 'Internal notes', type: 'textarea', wide: true, help: 'Never shown to the applicant.' },
      { name: 'decided_at', label: 'Decided', type: 'readonly' },
      { name: 'decided_by_name', label: 'Decided by', type: 'readonly' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'newsletters',
    label: 'Newsletters',
    singular: 'newsletter',
    group: 'Website',
    parent: 'Newsletter',
    icon: 'Mail',
    description:
      'The newsletter is a PDF; the email is a covering note pointing at it. A campaign is frozen once anyone has received it.',
    titleField: 'subject',
    searchHint: 'subject, issue, note',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'subject', label: 'Subject' },
      { name: 'issue_label', label: 'Issue' },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'audience_count', label: 'Audience', numeric: true },
      { name: 'sent_count', label: 'Sent', numeric: true },
      { name: 'is_public', label: 'On site' },
      { name: 'sent_at', label: 'Sent at' },
    ],
    filters: [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'sending', label: 'Sending' },
          { value: 'sent', label: 'Sent' },
          { value: 'failed', label: 'Failed' },
        ],
      },
      { name: 'country', label: 'Audience', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'subject', label: 'Email subject', type: 'text', required: true, wide: true },
      { name: 'issue_label', label: 'Issue', type: 'text', help: 'e.g. August 2026.' },
      { name: 'published_on', label: 'Issue date', type: 'date' },
      {
        name: 'pdf',
        label: 'Newsletter PDF',
        type: 'upload',
        folder: 'newsletter',
        wide: true,
        help: 'The newsletter itself. Upload it, or type a path already under /public.',
      },
      {
        name: 'cover_image',
        label: 'Cover image',
        type: 'upload',
        folder: 'newsletter',
        wide: true,
        help: 'Optional. Shown in the email above the link.',
      },
      { name: 'country', label: 'Audience', type: 'select', options: COUNTRY_OPTIONS, source: 'country', help: 'Global goes to every subscribed address.' },
      { name: 'preheader', label: 'Preview line', type: 'text', wide: true, help: 'The grey line after the subject in an inbox.' },
      { name: 'is_public', label: 'Publish on the website', type: 'boolean', help: 'Sending it and publishing it are separate decisions.' },
      { name: 'body', label: 'Covering note', type: 'textarea', wide: true, help: 'Optional. A short line or two above the link. Markdown.' },
    ],
  },
  {
    key: 'news',
    label: 'News stories',
    singular: 'story',
    group: 'Website',
    icon: 'Newspaper',
    titleField: 'title',
    searchHint: 'title, excerpt, body',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'title', label: 'Title' },
      { name: 'category', label: 'Category' },
      { name: 'date', label: 'Date' },
      { name: 'is_published', label: 'Published' },
    ],
    filters: [
      {
        name: 'is_published',
        label: 'Published',
        type: 'select',
        options: [
          { value: 'true', label: 'Published' },
          { value: 'false', label: 'Draft' },
        ],
      },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
      { name: 'slug', label: 'Slug', type: 'text', help: 'Left blank, it is made from the title.' },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'reading_time', label: 'Reading time', type: 'text' },
      { name: 'is_published', label: 'Published', type: 'boolean' },
      { name: 'excerpt', label: 'Standfirst', type: 'textarea', wide: true, required: true },
      { name: 'body', label: 'Body (Markdown)', type: 'textarea', wide: true, required: true },
      { name: 'image', label: 'Lead image', type: 'upload', folder: 'news', wide: true, help: 'Upload one, or type a path already under /public. Optional — better none than a stock photo.' },
      { name: 'image_alt', label: 'Image alt text', type: 'text', wide: true },
      { name: 'caption', label: 'Caption', type: 'text', wide: true },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'team',
    label: 'Team members',
    singular: 'team member',
    group: 'Website',
    icon: 'Contact',
    titleField: 'name',
    searchHint: 'name, role, bio',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'name', label: 'Name' },
      { name: 'role', label: 'Role' },
      { name: 'group_display', label: 'Group' },
      { name: 'order', label: 'Order', numeric: true },
      { name: 'is_published', label: 'Published' },
    ],
    filters: [
      {
        name: 'group',
        label: 'Group',
        type: 'select',
        options: [
          { value: 'leadership', label: 'Leadership' },
          { value: 'mentors', label: 'Mentors' },
          { value: 'volunteers', label: 'Outstanding volunteers' },
        ],
      },
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      {
        name: 'group',
        label: 'Group',
        type: 'select',
        options: [
          { value: 'leadership', label: 'Leadership' },
          { value: 'mentors', label: 'Mentors' },
          { value: 'volunteers', label: 'Outstanding volunteers' },
        ],
      },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'is_published', label: 'Published', type: 'boolean' },
      { name: 'image', label: 'Portrait', type: 'upload', folder: 'team', wide: true },
      { name: 'alt', label: 'Alt text', type: 'text', wide: true },
      { name: 'focus', label: 'Image focus', type: 'text', help: "CSS object-position, e.g. 'center 20%'." },
      { name: 'linkedin', label: 'LinkedIn', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'bio', label: 'Bio', type: 'textarea', wide: true },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'magazine',
    label: 'Magazine issues',
    singular: 'issue',
    group: 'Website',
    icon: 'BookOpen',
    titleField: 'name',
    searchHint: 'name, label, summary',
    columns: [
      { name: 'published_on', label: 'Issue date' },
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'name', label: 'Issue' },
      { name: 'label', label: 'Cover line' },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'file_contains', label: 'File holds' },
      { name: 'order', label: 'Order', numeric: true },
    ],
    fields: [
      { name: 'published_on', label: 'Issue date', type: 'date', help: 'The most recent issue leads the magazine page.' },
      { name: 'issue_id', label: 'Issue id', type: 'text', required: true, help: 'e.g. 2026' },
      { name: 'label', label: 'Cover line', type: 'text', required: true, help: 'As printed, e.g. 11/2026' },
      { name: 'name', label: 'Name in prose', type: 'text', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'published', label: 'Published' },
          { value: 'in-production', label: 'In production' },
        ],
      },
      { name: 'order', label: 'Order', type: 'number', help: 'Lowest is featured.' },
      { name: 'summary', label: 'Summary', type: 'textarea', wide: true },
      { name: 'cover', label: 'Cover', type: 'upload', folder: 'magazine', wide: true },
      { name: 'cover_alt', label: 'Cover alt text', type: 'text', wide: true },
      { name: 'wrap', label: 'Full cover wrap', type: 'upload', folder: 'magazine', wide: true, help: 'Back cover, spine and front, where one exists.' },
      { name: 'wrap_alt', label: 'Wrap alt text', type: 'text', wide: true },
      { name: 'file_href', label: 'Download file', type: 'upload', folder: 'magazine', wide: true },
      { name: 'file_filename', label: 'Saved filename', type: 'text' },
      { name: 'file_size', label: 'File size', type: 'text' },
      {
        name: 'file_contains',
        label: 'What the file holds',
        type: 'select',
        help: 'The page uses this so it never offers a cover as though it were the full issue.',
        options: [
          { value: '', label: '—' },
          { value: 'Full issue', label: 'Full issue' },
          { value: 'Cover', label: 'Cover' },
        ],
      },
      { name: 'epigraph_quote', label: 'Epigraph', type: 'textarea', wide: true, help: 'The quotation carried on the back cover.' },
      { name: 'epigraph_attribution', label: 'Attributed to', type: 'text' },
      { name: 'epigraph_source', label: 'Source', type: 'text' },
      {
        name: 'stories',
        label: 'What this issue covers',
        type: 'list',
        wide: true,
        addLabel: 'Add a cover story',
        help: 'Shown on the magazine page as the contents of the issue.',
        itemFields: [
          { name: 'title', label: 'Title' },
          { name: 'blurb', label: 'Blurb', type: 'textarea' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
  },
  {
    key: 'stats',
    label: 'Home page figures',
    singular: 'figure',
    group: 'Website',
    icon: 'TrendingUp',
    description:
      'The counters on the home page. Edited rather than counted — these are real-world totals, not row counts.',
    titleField: 'label',
    searchHint: 'label, note',
    columns: [
      { name: 'label', label: 'Figure' },
      { name: 'value', label: 'Value', numeric: true },
      { name: 'suffix', label: 'Suffix' },
      { name: 'order', label: 'Order', numeric: true },
      { name: 'is_published', label: 'Shown' },
    ],
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true, wide: true },
      { name: 'value', label: 'Value', type: 'number', required: true },
      { name: 'suffix', label: 'Suffix', type: 'text', help: "e.g. + for '120+'." },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'is_published', label: 'Shown on the home page', type: 'boolean' },
      { name: 'country', label: 'Country', type: 'select', options: [], source: 'country' },
      { name: 'note', label: 'Where this figure comes from', type: 'textarea', wide: true, help: 'Internal. Worth recording so the next person can check it.' },
    ],
  },
  {
    key: 'documents',
    label: 'All documents',
    singular: 'document',
    group: 'Operations',
    parent: 'Documents',
    icon: 'FileStack',
    description:
      'Handbooks, policies, forms and reports. The document is the enduring thing; each version of it is an edition.',
    titleField: 'title',
    searchHint: 'title, description',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'title', label: 'Document' },
      { name: 'category_display', label: 'Category' },
      { name: 'current_version', label: 'Current edition' },
      { name: 'edition_count', label: 'Editions', numeric: true },
      { name: 'is_public', label: 'On website' },
    ],
    filters: [
      {
        name: 'category', label: 'Category', type: 'select',
        options: [
          { value: 'handbook', label: 'Handbook' },
          { value: 'policy', label: 'Policy' },
          { value: 'form', label: 'Form' },
          { value: 'report', label: 'Report' },
          { value: 'template', label: 'Template' },
          { value: 'governance', label: 'Governance' },
          { value: 'finance', label: 'Finance' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
      { name: 'office', label: 'Office', type: 'select', options: [], source: 'office' },
      {
        name: 'is_archived', label: 'Archived', type: 'select',
        options: [
          { value: 'false', label: 'In use' },
          { value: 'true', label: 'Archived' },
        ],
      },
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, wide: true },
      { name: 'slug', label: 'Slug', type: 'text', help: 'Left blank, it is made from the title.' },
      {
        name: 'category', label: 'Category', type: 'select', required: true,
        options: [
          { value: 'handbook', label: 'Handbook' },
          { value: 'policy', label: 'Policy' },
          { value: 'form', label: 'Form' },
          { value: 'report', label: 'Report' },
          { value: 'template', label: 'Template' },
          { value: 'governance', label: 'Governance' },
          { value: 'finance', label: 'Finance' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'description', label: 'What it is for', type: 'textarea', wide: true },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
      { name: 'office', label: 'Office', type: 'select', options: [], source: 'office', help: 'Narrows to the chosen country.' },
      { name: 'owner', label: 'Owner', type: 'select', options: [], source: 'staff', help: 'Who keeps this current.' },
      { name: 'is_public', label: 'Published on the website', type: 'boolean', help: 'Leave off for anything internal.' },
      { name: 'is_archived', label: 'Archived', type: 'boolean', help: 'Keeps it out of the way without destroying it.' },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
  },
  {
    key: 'document-editions',
    label: 'Editions',
    singular: 'edition',
    group: 'Operations',
    parent: 'Documents',
    icon: 'Layers',
    description:
      'Every version of every document. Replacing an edition never destroys the one before it, so which version was in force stays answerable.',
    titleField: 'version',
    searchHint: 'version, document, summary',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'document_title', label: 'Document' },
      { name: 'version', label: 'Edition' },
      { name: 'effective_date', label: 'In force from' },
      { name: 'is_current', label: 'Current' },
      { name: 'uploaded_by_name', label: 'Added by' },
    ],
    filters: [
      { name: 'document', label: 'Document', type: 'select', options: [], source: 'document' },
      {
        name: 'is_current', label: 'Current', type: 'select',
        options: [
          { value: 'true', label: 'Current edition' },
          { value: 'false', label: 'Superseded' },
        ],
      },
    ],
    fields: [
      { name: 'document', label: 'Document', type: 'select', options: [], source: 'document', required: true },
      { name: 'version', label: 'Edition', type: 'text', required: true, help: 'How it is referred to, e.g. 2026/27 or v2.1.' },
      { name: 'file', label: 'File', type: 'upload', folder: 'documents', wide: true, help: 'Upload the file, or give a link below if it lives in Drive or OneDrive.' },
      { name: 'external_url', label: 'Link instead', type: 'text', wide: true },
      { name: 'effective_date', label: 'In force from', type: 'date' },
      { name: 'is_current', label: 'This is the current edition', type: 'boolean', help: 'Only one per document.' },
      { name: 'summary', label: 'What changed', type: 'textarea', wide: true },
    ],
  },
  {
    key: 'countries',
    label: 'Countries',
    singular: 'country',
    group: 'Operations',
    parent: 'Countries & offices',
    icon: 'Globe',
    description:
      'Where the Foundation operates. Country and currency choices everywhere else are drawn from here.',
    titleField: 'name',
    searchHint: 'name, code, currency',
    columns: [
      { name: 'name', label: 'Country' },
      { name: 'code', label: 'Code' },
      { name: 'currency_code', label: 'Currency' },
      { name: 'main_office', label: 'Main office' },
      { name: 'order', label: 'Order', numeric: true },
      { name: 'is_active', label: 'Active' },
    ],
    fields: [
      { name: 'name', label: 'Country', type: 'text', required: true },
      { name: 'code', label: 'Two-letter code', type: 'text', required: true, help: "Matches the country stored on other records. 'GL' is reserved for Global." },
      { name: 'currency_code', label: 'Currency code', type: 'text', required: true, help: 'ISO 4217, e.g. UGX.' },
      { name: 'currency_symbol', label: 'Currency symbol', type: 'text' },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
  },
  {
    key: 'offices',
    label: 'Offices',
    singular: 'office',
    group: 'Operations',
    parent: 'Countries & offices',
    icon: 'Building2',
    description: 'Where the Foundation works from. One main office per country, plus any others.',
    titleField: 'name',
    searchHint: 'name, city, email',
    columns: [
      { name: 'name', label: 'Office' },
      { name: 'country_name', label: 'Country' },
      { name: 'city', label: 'City' },
      { name: 'is_main', label: 'Main' },
      { name: 'lead_name', label: 'Lead' },
      { name: 'staff_headcount', label: 'Staff', numeric: true },
      { name: 'is_active', label: 'Active' },
    ],
    filters: [{ name: 'country', label: 'Country', type: 'select', options: [], source: 'countryId' }],
    fields: [
      { name: 'name', label: 'Office name', type: 'text', required: true },
      { name: 'country', label: 'Country', type: 'select', options: [], source: 'countryId', required: true },
      { name: 'is_main', label: 'Main office for this country', type: 'boolean', help: 'Only one per country.' },
      { name: 'city', label: 'City / town', type: 'text' },
      { name: 'region', label: 'Region', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea', wide: true },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'lead', label: 'Office lead', type: 'select', options: [], source: 'staff', help: 'Who runs this office.' },
      { name: 'registration_number', label: 'Registration number', type: 'text', help: 'As registered with the authorities in this country.' },
      { name: 'staff_headcount', label: 'Staff based here', type: 'number' },
      { name: 'established_on', label: 'Established', type: 'date' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
  },
  {
    key: 'activity',
    label: 'Activity log',
    singular: 'entry',
    group: 'Access',
    icon: 'ScrollText',
    description:
      'Who did what, and when. Written as things happen and never edited — there is no way to change an entry from in here.',
    titleField: 'summary',
    searchHint: 'person, record, detail',
    // Append-only: the API exposes no write routes, and the policy grants only
    // view. These flags keep the interface honest about that — no create, and
    // a detail page that reads as a record rather than a disabled form.
    noCreate: true,
    readOnly: true,
    columns: [
      { name: 'created_at', label: 'When' },
      { name: 'actor_name', label: 'Who' },
      { name: 'action_display', label: 'Did what', badge: true },
      { name: 'object_label', label: 'To which record' },
      { name: 'change_summary', label: 'What changed' },
    ],
    filters: [
      {
        name: 'action', label: 'Action', type: 'select',
        options: [
          { value: 'create', label: 'Created' },
          { value: 'update', label: 'Updated' },
          { value: 'delete', label: 'Deleted' },
          { value: 'send', label: 'Sent' },
          { value: 'access_change', label: 'Changed access' },
          { value: 'upload', label: 'Uploaded a file' },
          { value: 'login', label: 'Signed in' },
          { value: 'login_failed', label: 'Failed sign-in' },
          { value: 'logout', label: 'Signed out' },
        ],
      },
      { name: 'resource', label: 'Area', type: 'text' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
    ],
    fields: [
      { name: 'created_at', label: 'When', type: 'text' },
      { name: 'actor_name', label: 'Who', type: 'text' },
      { name: 'action_display', label: 'Action', type: 'text' },
      { name: 'resource', label: 'Area', type: 'text' },
      { name: 'object_label', label: 'Record', type: 'text', wide: true },
      { name: 'change_summary', label: 'What changed', type: 'textarea', wide: true },
      { name: 'detail', label: 'Detail', type: 'textarea', wide: true },
      { name: 'ip_address', label: 'IP address', type: 'text' },
      { name: 'user_agent', label: 'Browser', type: 'text', wide: true },
    ],
  },
  {
    key: 'users',
    label: 'Staff access',
    singular: 'account',
    group: 'Access',
    icon: 'ShieldCheck',
    description: 'Who can sign in. Roles and country scope are set in the Django admin.',
    titleField: 'username',
    searchHint: 'username, email, name',
    columns: [
      { name: 'username', label: 'Username' },
      { name: 'email', label: 'Email' },
      { name: 'first_name', label: 'First name' },
      { name: 'is_staff', label: 'Staff' },
      { name: 'is_superuser', label: 'Superuser' },
      { name: 'is_active', label: 'Active' },
    ],
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'first_name', label: 'First name', type: 'text' },
      { name: 'last_name', label: 'Last name', type: 'text' },
      { name: 'is_staff', label: 'Dashboard access', type: 'boolean' },
      { name: 'is_active', label: 'Active', type: 'boolean' },
      { name: 'is_superuser', label: 'Superuser', type: 'boolean' },
    ],
  },
  {
    key: 'scholarships',
    label: 'Bursaries',
    singular: 'bursary',
    group: 'Programmes',
    parent: 'Scholarships',
    icon: 'GraduationCap',
    description:
      'A student on a bursary: who pays, which school, what it covers, and how long it runs. The money actually sent to each school is recorded against it as payments.',
    titleField: 'student_name',
    searchHint: 'student, school, sponsor, guardian, reference',
    columns: [
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'student_name', label: 'Student' },
      { name: 'reference', label: 'Ref' },
      { name: 'school_name', label: 'School' },
      { name: 'current_class', label: 'Class' },
      { name: 'sponsor_name', label: 'Paid for by' },
      { name: 'total_paid', label: 'Paid to date', numeric: true },
      { name: 'status_display', label: 'Status', badge: true },
    ],
    filters: [
      {
        name: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'pending', label: 'Pending start' },
          { value: 'active', label: 'Active' },
          { value: 'suspended', label: 'Suspended' },
          { value: 'completed', label: 'Completed' },
          { value: 'terminated', label: 'Terminated' },
        ],
      },
      {
        name: 'school_level', label: 'Level', type: 'select',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'vocational', label: 'Vocational / technical' },
          { value: 'tertiary', label: 'University / tertiary' },
        ],
      },
      {
        name: 'sponsor_type', label: 'Sponsor', type: 'select',
        options: [
          { value: 'individual', label: 'Individual' },
          { value: 'organisation', label: 'Organisation' },
          { value: 'church', label: 'Church or faith group' },
          { value: 'foundation', label: 'Trust or foundation' },
          { value: 'jdiobe', label: 'JdiobeSTEM general fund' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
      { name: 'office', label: 'Office', type: 'select', options: [], source: 'office' },
    ],
    fields: [
      { name: 'student_name', label: 'Student name', type: 'text', required: true, wide: true },
      {
        name: 'photo', label: 'Photograph', type: 'upload', folder: 'scholarships', wide: true,
        help: 'Uploads are served from a public address — see the note before adding a child\u2019s photograph.',
      },
      { name: 'reference', label: 'Reference', type: 'readonly', help: 'Issued by the system when the bursary is created.' },
      {
        name: 'gender', label: 'Gender', type: 'select',
        options: [
          { value: '', label: 'Not recorded' },
          { value: 'female', label: 'Female' },
          { value: 'male', label: 'Male' },
          { value: 'other', label: 'Prefer not to say' },
        ],
      },
      { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
      { name: 'student_phone', label: 'Student phone', type: 'tel' },

      { name: 'school_name', label: 'School', type: 'text', required: true, wide: true },
      {
        name: 'school_level', label: 'Level', type: 'select',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'vocational', label: 'Vocational / technical' },
          { value: 'tertiary', label: 'University / tertiary' },
        ],
      },
      {
        name: 'class_at_award', label: 'Class when the bursary started', type: 'text',
        help: 'Never changes. It is what makes progress answerable years later.',
      },
      { name: 'current_class', label: 'Class now', type: 'text' },
      { name: 'school_contact', label: 'School contact', type: 'text', wide: true, help: 'Bursar or head teacher, and how to reach them.' },
      { name: 'school_account', label: 'Where fees are paid', type: 'text', wide: true, help: 'Kept so a transfer can be checked against it.' },

      { name: 'sponsor_name', label: 'Paid for by', type: 'text', wide: true, help: 'Who is funding this student.' },
      {
        name: 'sponsor_type', label: 'Kind of sponsor', type: 'select',
        options: [
          { value: '', label: 'Not recorded' },
          { value: 'individual', label: 'Individual' },
          { value: 'organisation', label: 'Organisation' },
          { value: 'church', label: 'Church or faith group' },
          { value: 'foundation', label: 'Trust or foundation' },
          { value: 'jdiobe', label: 'JdiobeSTEM general fund' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'sponsor_contact', label: 'Sponsor contact', type: 'text', wide: true },

      { name: 'amount_per_term', label: 'Amount per term', type: 'number' },
      { name: 'total_committed', label: 'Total committed', type: 'number', help: 'If a whole figure was agreed up front.' },
      { name: 'currency', label: 'Currency', type: 'select', options: CURRENCY_OPTIONS, source: 'currency' },
      { name: 'started_on', label: 'Started', type: 'date' },
      { name: 'expected_end_on', label: 'Expected to finish', type: 'date', help: 'How long the bursary is expected to run.' },
      {
        name: 'status', label: 'Status', type: 'select', required: true,
        options: [
          { value: 'pending', label: 'Pending start' },
          { value: 'active', label: 'Active' },
          { value: 'suspended', label: 'Suspended' },
          { value: 'completed', label: 'Completed' },
          { value: 'terminated', label: 'Terminated' },
        ],
      },
      { name: 'ended_on', label: 'Ended', type: 'date', help: 'Required once the status is completed or terminated.' },
      {
        name: 'termination_reason', label: 'Why it ended', type: 'textarea', wide: true,
        help: 'Required when a bursary is terminated rather than completed.',
      },

      {
        name: 'benefits', label: 'What else the bursary covers', type: 'list', wide: true,
        addLabel: 'Add a benefit',
        itemFields: [
          { name: 'label', label: 'Benefit' },
          { name: 'detail', label: 'Detail' },
        ],
      },

      { name: 'guardian_name', label: 'Parent or guardian', type: 'text', wide: true },
      { name: 'guardian_relationship', label: 'Relationship', type: 'text', help: 'Mother, father, aunt, grandparent…' },
      { name: 'guardian_phone', label: 'Guardian phone', type: 'tel' },
      { name: 'guardian_address', label: 'Guardian address', type: 'text', wide: true },

      { name: 'managed_by', label: 'Looked after by', type: 'select', options: [], source: 'staff', help: 'Who at the Foundation follows this student.' },
      { name: 'country', label: 'Country', type: 'select', options: COUNTRY_OPTIONS, source: 'country' },
      { name: 'office', label: 'Office', type: 'select', options: [], source: 'office', help: 'Narrows to the chosen country.' },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
    ],
  },
  {
    key: 'scholarship-payments',
    label: 'Payments to schools',
    singular: 'payment',
    group: 'Programmes',
    parent: 'Scholarships',
    icon: 'Receipt',
    description:
      'Every transfer made to a school under a bursary, with its receipt. Kept as separate rows rather than a running total, so what was paid in a given term stays answerable.',
    titleField: 'term',
    searchHint: 'student, school, term, reference',
    columns: [
      { name: 'receipt', label: '', thumb: true },
      { name: 'student_name', label: 'Student' },
      { name: 'school_name', label: 'School' },
      { name: 'term', label: 'Covers' },
      { name: 'amount', label: 'Amount', numeric: true },
      { name: 'currency', label: 'Currency' },
      { name: 'paid_on', label: 'Paid', date: true },
      { name: 'method_display', label: 'Method', badge: true },
    ],
    filters: [
      { name: 'scholarship', label: 'Bursary', type: 'select', options: [], source: 'scholarship' },
      {
        name: 'method', label: 'Method', type: 'select',
        options: [
          { value: 'bank', label: 'Bank transfer' },
          { value: 'mobile', label: 'Mobile money' },
          { value: 'cheque', label: 'Cheque' },
          { value: 'cash', label: 'Cash' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
    fields: [
      { name: 'scholarship', label: 'Bursary', type: 'select', options: [], source: 'scholarship', required: true, wide: true },
      { name: 'paid_on', label: 'Date paid', type: 'date', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'select', options: CURRENCY_OPTIONS, source: 'currency' },
      { name: 'term', label: 'What it covers', type: 'text', help: 'e.g. Term 1 2026.' },
      { name: 'academic_year', label: 'Academic year', type: 'text', help: 'e.g. 2026.' },
      {
        name: 'method', label: 'Method', type: 'select',
        options: [
          { value: 'bank', label: 'Bank transfer' },
          { value: 'mobile', label: 'Mobile money' },
          { value: 'cheque', label: 'Cheque' },
          { value: 'cash', label: 'Cash' },
          { value: 'other', label: 'Other' },
        ],
      },
      { name: 'reference', label: 'Reference', type: 'text', help: 'Bank or mobile money reference.' },
      { name: 'paid_to', label: 'Paid to', type: 'text', wide: true, help: 'Only if it did not go to the school\u2019s usual account.' },
      { name: 'receipt', label: 'Receipt', type: 'upload', folder: 'receipts', wide: true },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
      { name: 'recorded_by_name', label: 'Recorded by', type: 'readonly' },
    ],
  },
];

export const RESOURCE_BY_KEY = Object.fromEntries(RESOURCES.map((r) => [r.key, r]));

type OptionSource = NonNullable<Field['source']>;

function optionsFor(
  source: OptionSource,
  options: {
    countries: { value: string; label: string }[];
    currencies: { value: string; label: string }[];
    countryIds?: { value: string; label: string }[];
    offices?: { value: string; label: string }[];
    documents?: { value: string; label: string }[];
    staff?: { value: string; label: string }[];
    projects?: { value: string; label: string }[];
    scholarships?: { value: string; label: string }[];
  }
) {
  if (source === 'currency') return options.currencies;
  // `countryId` picks a row in the countries table; `country` picks a code
  // stored on the record. They look alike and are not interchangeable.
  if (source === 'countryId') return options.countryIds ?? [];
  if (source === 'office') return options.offices ?? [];
  if (source === 'document') return options.documents ?? [];
  if (source === 'staff') return options.staff ?? [];
  if (source === 'project') return options.projects ?? [];
  if (source === 'scholarship') return options.scholarships ?? [];
  return options.countries;
}

/** Substitute the data-driven options into a resource's fields. */
export function withOptions(
  resource: Resource,
  options: {
    countries: { value: string; label: string }[];
    currencies: { value: string; label: string }[];
    countryIds?: { value: string; label: string }[];
    offices?: { value: string; label: string }[];
    documents?: { value: string; label: string }[];
    staff?: { value: string; label: string }[];
    projects?: { value: string; label: string }[];
    scholarships?: { value: string; label: string }[];
  }
): Resource {
  return {
    ...resource,
    fields: resource.fields.map((f) =>
      f.source ? { ...f, options: optionsFor(f.source, options) } : f
    ),
    filters: resource.filters?.map((f) =>
      f.source ? { ...f, options: optionsFor(f.source, options) } : f
    ),
  };
}

export const GROUP_ORDER: Resource['group'][] = [
  'Inbox',
  'Giving',
  'Programmes',
  'Website',
  'Operations',
  'Access',
];
