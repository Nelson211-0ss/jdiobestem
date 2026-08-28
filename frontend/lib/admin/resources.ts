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
  source?: 'country' | 'currency' | 'countryId' | 'office' | 'document' | 'staff';
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
    label: 'Volunteer applications',
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
    label: 'Science Fair registrations',
    singular: 'registration',
    group: 'Inbox',
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
    label: 'Donations',
    singular: 'donation',
    group: 'Giving',
    icon: 'HeartHandshake',
    description: 'Mirrored from Stripe. Read-only — Stripe is the source of truth.',
    titleField: 'donor_name',
    noCreate: true,
    searchHint: 'donor name, email, Stripe id',
    columns: [
      { name: 'created_at', label: 'Date', date: true },
      { name: 'donor_name', label: 'Donor' },
      { name: 'donor_email', label: 'Email' },
      { name: 'amount_display', label: 'Amount', numeric: true },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'livemode', label: 'Live' },
    ],
    filters: [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'succeeded', label: 'Succeeded' },
          { value: 'pending', label: 'Pending' },
          { value: 'failed', label: 'Failed' },
          { value: 'refunded', label: 'Refunded' },
        ],
      },
      {
        name: 'livemode',
        label: 'Mode',
        type: 'select',
        options: [
          { value: 'true', label: 'Live' },
          { value: 'false', label: 'Test' },
        ],
      },
    ],
    fields: [
      { name: 'donor_name', label: 'Donor', type: 'readonly' },
      { name: 'donor_email', label: 'Email', type: 'readonly' },
      { name: 'amount_display', label: 'Amount', type: 'readonly' },
      { name: 'currency', label: 'Currency', type: 'readonly' },
      { name: 'status_display', label: 'Status', type: 'readonly' },
      { name: 'livemode', label: 'Live mode', type: 'readonly' },
      { name: 'stripe_session_id', label: 'Stripe session', type: 'readonly', wide: true },
      { name: 'stripe_payment_intent', label: 'Payment intent', type: 'readonly', wide: true },
      { name: 'receipt_url', label: 'Receipt', type: 'readonly', wide: true },
      { name: 'amount_cents', label: 'Amount in minor units', type: 'readonly' },
      { name: 'created_at', label: 'Received', type: 'readonly' },
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
      { name: 'thumbnail', label: '', thumb: true },
      { name: 'name', label: 'Issue' },
      { name: 'label', label: 'Cover line' },
      { name: 'status_display', label: 'Status', badge: true },
      { name: 'file_contains', label: 'File holds' },
      { name: 'order', label: 'Order', numeric: true },
    ],
    fields: [
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
    icon: 'Building2',
    description: 'Where the Foundation works from. One main office per country, plus any others.',
    titleField: 'name',
    searchHint: 'name, city, email',
    columns: [
      { name: 'name', label: 'Office' },
      { name: 'country_name', label: 'Country' },
      { name: 'city', label: 'City' },
      { name: 'is_main', label: 'Main' },
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
    // view. The flag keeps the interface honest about that.
    noCreate: true,
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
  }
) {
  if (source === 'currency') return options.currencies;
  // `countryId` picks a row in the countries table; `country` picks a code
  // stored on the record. They look alike and are not interchangeable.
  if (source === 'countryId') return options.countryIds ?? [];
  if (source === 'office') return options.offices ?? [];
  if (source === 'document') return options.documents ?? [];
  if (source === 'staff') return options.staff ?? [];
  return options.countries;
}

/** Substitute the data-driven options into a resource's fields. */
export function withOptions(
  resource: Resource,
  options: { countries: { value: string; label: string }[]; currencies: { value: string; label: string }[] }
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
