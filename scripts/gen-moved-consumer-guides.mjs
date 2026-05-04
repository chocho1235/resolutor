/**
 * One-off generator: inserts five consumer guide pages (replacing former article markup).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const tmplPath = path.join(root, "consumer/if-retailer-refuses-price-match.html");
let tmpl = fs.readFileSync(tmplPath, "utf8");

/** Replace `<head>...</head>` for a consumer guide */
function swapHead(html, { title, desc, slug, ogImage }) {
  const canon = `https://www.resolutor.co.uk/consumer/${slug}`;
  return html.replace(
    /<head>[\s\S]*?<\/head>/,
    `<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>${title} | Resolutor Legal Support</title>
    <meta name="description" content="${desc.replace(/"/g, "&quot;")}" />
    <link rel="canonical" href="${canon}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Resolutor Legal Support" />
    <meta property="og:title" content="${title} | Resolutor Legal Support" />
    <meta property="og:description" content="${desc.replace(/"/g, "&quot;")}" />
    <meta property="og:url" content="${canon}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="800" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} | Resolutor Legal Support" />
    <meta name="twitter:description" content="${desc.replace(/"/g, "&quot;")}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="preconnect" href="https://images.pexels.com" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
  </head>`,
  );
}

const pages = [
  {
    slug: "deposits-when-refundable",
    title: "Deposits — when you can get one back and when you cannot",
    desc: "Deposits v part payments, when they are returnable, package holidays and events — England and Wales. General information only.",
    ogImage:
      "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    breadcrumb: "Deposits — refundable or not",
    eyebrowTopic: "Contracts and money",
    h1: "Deposits — when you can get one back and when you cannot",
    lede:
      "Paying a deposit feels routine. When things fall through, whether you get that money back depends on why the deal failed, what was agreed, and what the payment actually was.",
    heroSrc:
      "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    heroAlt: "Coins and paper banknotes (stock photograph).",
    heroCaption: "Photo: Pexels (currency / savings).",
    toc: [
      ["#what-is-deposit", "What is a deposit legally?"],
      ["#when-not-back", "When you probably cannot get it back"],
      ["#when-back", "When you can get it back"],
      ["#holidays-events", "Holidays and events"],
      ["#what-to-do", "What should you do?"],
      ["#short-version", "The short version"],
      ["#consumer-more", "All consumer resources"],
    ],
    body: `
                <h2 id="what-is-deposit" class="consumer-page__subheading consumer-guide__h">What is a deposit legally?</h2>
                <p class="about-page__prose">
                  A deposit is not the same thing as a <strong>part payment</strong>, though people use the words interchangeably. As commonly understood in disputes, a <strong>deposit</strong> is often taken as security: it signals you are serious about the contract and gives the other side something to retain if you walk away without good reason.
                  A mere <strong>part payment</strong>, by contrast, is money paid early against the total. If the contract ends without breach on your side, arguing it back is often easier than where a genuine non-refundable deposit was agreed.
                  Much turns on wording, receipts and industry practice — and paperwork often avoids spelling out which flavour you paid.
                </p>

                <h2 id="when-not-back" class="consumer-page__subheading consumer-guide__h">When you probably cannot get it back</h2>
                <p class="about-page__prose">
                  If you paid a deposit and then <strong>changed your mind</strong> without a lawful basis to cancel, the starting position is that the other party may keep it. That is broadly what deposits are for.
                  The same idea applies if <strong>you</strong> broke the contract in a way that caused them to terminate. If your conduct ended the deal, recovery is unlikely.
                </p>
                <p class="about-page__prose">
                  There are limits: if the sum retained looks <strong>unrelated to realistic loss</strong> and punitive in substance, arguments familiar from penalty-clause caselaw can arise (whether the label says &ldquo;deposit&rdquo; or not).
                  What counts as disproportionate is fact-sensitive; large headline percentages with little evidence of loss face more scrutiny than modest, conventional deposits.
                </p>

                <h2 id="when-back" class="consumer-page__subheading consumer-guide__h">When you can get it back</h2>
                <p class="about-page__prose">
                  If <strong>they</strong> cancel or materially fail to perform, you will normally expect your deposit returned (and potentially further remedies if you suffer additional loss — that is a wider question).
                  If <strong>no contract ever properly formed</strong> — fundamental terms unsettled, misrepresentation vitiating consent, or the subject matter never existed &mdash; you may recover on failure of basis or unjust enrichment principles, depending on facts.
                </p>
                <p class="about-page__prose">
                  <strong>Consumer</strong> contracts add another lens. Trader cancellation often strengthens statutory and fair-dealing angles. Blanket clauses saying a deposit is <em>never</em> refundable no matter who cancels may engage <strong>unfair contract terms</strong> analysis under the Consumer Rights Act regime &mdash;
                  especially where they skew obviously against good faith — but each clause needs reading in context.
                </p>

                <h2 id="holidays-events" class="consumer-page__subheading consumer-guide__h">Holidays and events</h2>
                <p class="about-page__prose">
                  <strong>Package holidays</strong> sit under dedicated UK legislation (the successor rules to older package-travel protections). Operator cancellation generally triggers refund rights broadly aligned with traveller protection —
                  verify current rules on <a href="https://www.gov.uk/atol-protection" rel="noopener noreferrer">GOV.UK: ATOL protection and related package guidance</a> and ABTA/AITO materials where relevant.
                  <strong>Events</strong> (weddings, venues, entertainers) hinge on your written terms. Force majeure or common-law <strong>frustration</strong> &mdash;
                  termination without fault due to unforeseeable impossibility &mdash;
                  may redistribute losses in ways neither party prefers; specialised advice pays off quickly when six-figure venue fees are involved.
                </p>

                <h2 id="what-to-do" class="consumer-page__subheading consumer-guide__h">What should you do?</h2>
                <p class="about-page__prose">
                  If you believe you are entitled to your deposit back, put the demand <strong>in writing</strong>: what was agreed (with dates), what happened, why you say return is due, supporting documents, and a reasonable deadline for payment.
                  <strong>How you paid matters</strong>: qualifying <strong>credit card</strong> purchases may engage <strong>Section 75</strong>; debit cards sometimes support <strong>chargeback</strong> where scheme rules permit.
                  Our <a href="/consumer/refund-card-paypal">card and PayPal guide</a> walks through contours. Beyond that,
                  <a href="/articles/small-claims-court">County Court money claims</a> remain proportionate mainly when the quantum justifies preparation and issuing fees.
                </p>
                <p class="about-page__prose">
                  Keep evidence throughout &mdash;
                  confirmations, adverts, chats, brochures. Poor paperwork does not doom every claim but it lengthens fights you could have shortened.
                </p>

                <h2 id="short-version" class="consumer-page__subheading consumer-guide__h">The short version</h2>
                <p class="about-page__prose">
                  Refunds depend heavily on who ended the bargain and whether the withheld sum resembles genuine security versus oppressive forfeiture.
                  Counterparty breach usually supports return (plus conversation about damages); unilateral purchaser cold feet usually supports retention &mdash;
                  absent unfair terms or penalty characterisation.
                </p>
                <p class="about-page__prose">
                  <em>Nothing on this page is legal advice for your specific situation.</em>
                </p>`,
  },
  {
    slug: "horse-injury-on-your-land-liability",
    title: "If a horse injures someone on your land — who is liable",
    desc: "Animals Act 1971, keeper, occupy duties and public liability insurance — injuries involving horses on your land in England and Wales.",
    ogImage:
      "https://images.pexels.com/photos/14609073/pexels-photo-14609073.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    breadcrumb: "Horse injury on your land — liability",
    eyebrowTopic: "Equestrian and land",
    h1: "If a horse injures someone on your land &mdash; who is liable",
    lede:
      "Several overlapping rules apply when someone is hurt on land where horses are kept. Keeper, possessions and occupy duties decide who carries the risk alongside insurance.",
    heroSrc:
      "https://images.pexels.com/photos/14609073/pexels-photo-14609073.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    heroAlt: "Horse in stable wearing a leather bridle (stock photograph).",
    heroCaption: "Photo: Pexels (horse in stable).",
    toc: [
      ["#animals-act", "The Animals Act 1971"],
      ["#who-keeper", "Who counts as the keeper?"],
      ["#occupiers", "Occupiers&rsquo; liability"],
      ["#contributory", "Contributory negligence"],
      ["#insurance", "Insurance"],
      ["#short-version", "The short version"],
      ["#consumer-more", "All consumer resources"],
    ],
    body: `
                <h2 id="animals-act" class="consumer-page__subheading consumer-guide__h">The Animals Act 1971</h2>
                <p class="about-page__prose">
                  The usual starting point is the
                  <a href="https://www.legislation.gov.uk/ukpga/1971/22/contents" rel="noopener noreferrer">Animals Act 1971</a>. It creates a form of strict liability for keepers of animals that belong to a dangerous species, or non-dangerous animals with particular characteristics dealt with elsewhere in the Act.
                  Horses are not treated as a dangerous species here, yet the statute can still apply through the limb addressing known characteristics beyond the baseline for the species: where a characteristic makes injury more likely in the statutory sense,
                  injury resulting from it can expose the keeper &mdash;
                  sometimes even without negligence in the ordinary sense being proved.
                  How that limb applies in court is notoriously fact-heavy; specialist advice belongs on serious cases.
                </p>
                <p class="about-page__prose">
                  Practical risk: behaviours you know about (&ldquo;kicks when approached from behind,&rdquo; habitual biting during grooming &mdash;) must be communicated and guarded against before guests handle the horse.
                </p>

                <h2 id="who-keeper" class="consumer-page__subheading consumer-guide__h">Who counts as the keeper?</h2>
                <p class="about-page__prose">
                  The keeper is the person who <strong>owns</strong> the horse or has it <strong>in possession</strong>. Loans shift who holds possession across time periods; livery stacks contracts and yard rules on top.
                  If a horse is kept at your yard but owned by someone else, liability tends to concentrate on whoever actually controls possession &mdash;
                  unless you negligently contributed through unsafe premises. See also our consumer guide <a href="/consumer/loaning-a-horse-liability-agreements">loaning a horse &mdash; liability and agreements</a>.
                </p>

                <h2 id="occupiers" class="consumer-page__subheading consumer-guide__h">Occupiers&rsquo; liability</h2>
                <p class="about-page__prose">
                  Separately from the Animals Act, anyone who occupies land owes duties under the occupiers liability legislation (<a href="https://www.legislation.gov.uk/ukpga/1957/31/contents" rel="noopener noreferrer">Occupiers Liability Act 1957</a> for many lawful visitors; <a href="https://www.legislation.gov.uk/ukpga/1984/3/contents" rel="noopener noreferrer">Occupiers Liability Act 1984</a> addressing certain risks even to unauthorised entrants).
                  Where someone is injured because of bad fencing, collapsing gates or other hazards associated with controlling animals, premises claims remain available even absent &ldquo;dangerous temperament&rdquo; arguments about the horse itself.
                </p>

                <h2 id="contributory" class="consumer-page__subheading consumer-guide__h">Contributory negligence</h2>
                <p class="about-page__prose">
                  If an injured visitor ignored signage, ventured into barred areas or approached horses contrary to briefing, courts can reduce damages to reflect comparative fault under well-known principles applied across tort claims.
                  Clear instructions and repeatable yard culture help document what was reasonably expected from visitors.
                </p>

                <h2 id="insurance" class="consumer-page__subheading consumer-guide__h">Insurance</h2>
                <p class="about-page__prose">
                  Public liability insurance for horse activities is practically essential even though it is not a universal statutory mandate. Serious injury verdicts dwarf premium costs; defending doubtful claims drains resources too.
                  Most professional yards insist owners demonstrate cover; read endorsements affecting commercial instruction, outings and third-party indemnity breadth before incidents occur rather than scrambling afterwards.
                </p>

                <h2 id="short-version" class="consumer-page__subheading consumer-guide__h">The short version</h2>
                <p class="about-page__prose">
                  Liability intertwines Animals Act keeper questions, factual possession, occupiers responsibilities and claimant conduct &mdash;
                  crowned by arranging adequate liability insurance sooner rather than later.
                </p>
                <p class="about-page__prose">
                  <em>Nothing on this page is legal advice for your specific situation.</em>
                </p>`,
  },
  {
    slug: "formal-complaint-letter-gets-response",
    title: "How to write a formal complaint letter that actually gets a response",
    desc: "Structure, evidence, tone and deadlines — complaint letters courts, ombudsmen and traders take seriously.",
    ogImage:
      "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    breadcrumb: "Formal complaint letters",
    eyebrowTopic: "Dispute resolution",
    h1: "How to write a formal complaint letter that actually gets a response",
    lede:
      "Most complaints fail because nobody can act on them. A disciplined letter improves outcomes and leaves a credible paper trail.",
    extraIntro: `
                <p class="about-page__prose">
                  Most complaints stumble because nobody can act on them: missing dates, drifting tone, unidentified documents. A disciplined letter improves outcomes and builds leverage if escalation follows.
                  The following framing suits many <strong>England and Wales</strong> disputes (consumer or modest commercial); it remains <strong>general information only</strong> &mdash; not legal advice tailored to your file.
                </p>`,
    heroSrc:
      "https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    heroAlt: "Vintage typewriter and paper (stock photograph).",
    heroCaption: "Photo: Pexels (typewriter).",
    toc: [
      ["#why-letter", "Why a letter still matters"],
      ["#before-write", "Before you write anything"],
      ["#what-include", "What to include"],
      ["#tone", "Tone"],
      ["#structure", "A basic structure"],
      ["#no-response", "What if they do not respond?"],
      ["#short-version", "The short version"],
      ["#consumer-more", "All consumer resources"],
    ],
    body: `
                <h2 id="why-letter" class="consumer-page__subheading consumer-guide__h">Why a letter still matters</h2>
                <p class="about-page__prose">
                  Calls vanish unless recorded in follow-up emails. Threads on socials rarely capture undertakings. Structured correspondence anchored to timelines creates <strong>credible contemporaneous proof</strong> for internal complaints teams, insurers, regulators, ombudsmen and ultimately courts exercising case-management discretion around pre-action conduct.
                  Many procedures expect you exhausted proportionate avenues before escalating.
                </p>

                <h2 id="before-write" class="consumer-page__subheading consumer-guide__h">Before you write anything</h2>
                <p class="about-page__prose">
                  <strong>Decide the remedy</strong> — refund, repair, replacement, compensation, apology, change of process. Vague endings (&ldquo;sort this out&rdquo;) frustrate decision-makers; specify outcomes and attach realistic quantum when money is due.
                  <strong>Collate evidence</strong> — contracts, marketing screenshots, delivery notes, repair estimates, medical records (where relevant &mdash; mind data protection), chat exports. Index PDFs if sending large bundles.
                  <strong>Target the right desk</strong> — published complaints policies, regulatory registers, or <a href="https://www.gov.uk/government/organisations/companies-house" rel="noopener noreferrer">Companies House</a> director registers can identify accountable individuals when customer-service queues stall.
                </p>

                <h2 id="what-include" class="consumer-page__subheading consumer-guide__h">What to include</h2>
                <p class="about-page__prose">
                  First, a neutral chronology: who, what, where, when, how much. Second, why it matters &mdash; wasted time, financial loss, safety impact. Third, succinct reference to statutory rights where appropriate (&ldquo;goods did not match description under Consumer Rights Act 2015,&rdquo; etc.) — no need for excessive flourish; signalling awareness resets tone.
                  Fourth, the redress demanded with a deadline &mdash;
                  fourteen days suits many consumer situations though regulated sectors prescribe their own windows. Offer proportionate supplementary evidence if attachments run long.
                  Our <a href="/consumer">consumer resources hub</a> links deeper topic briefings where sector-specific rules apply beyond generic wording.
                </p>

                <h2 id="tone" class="consumer-page__subheading consumer-guide__h">Tone</h2>
                <p class="about-page__prose">
                  Cool, succinct professionalism beats theatrical threats. Emotional venting invites dismissive replies focused on sentiment rather than substance.
                  When you reference court, regulators or media, do so only if genuine intention exists &mdash;
                  bluffing destroys credibility if later contradicted.
                </p>

                <h2 id="structure" class="consumer-page__subheading consumer-guide__h">A basic structure</h2>
                <p class="about-page__prose">
                  Your contact block, date, recipient name and address, reference line (&ldquo;Formal complaint concerning order #&hellip;&rdquo;), narrative paragraphs, numbered demands, closing deadline, courteous sign-off (&ldquo;Yours sincerely&rdquo; if you addressed someone by name, &ldquo;Yours faithfully&rdquo; if you opened with &ldquo;Dear Sir or Madam&rdquo;), and an enclosures list where you attach evidence.
                  Retain duplicates and proof of posting or tracking where delivery matters.
                </p>

                <h2 id="no-response" class="consumer-page__subheading consumer-guide__h">What if they do not respond?</h2>
                <p class="about-page__prose">
                  Escalatory routes hinge on sector: <a href="/consumer/ombudsman-schemes-explained">ombudsman schemes</a>,
                  <a href="/articles/small-claims-court">small claims court</a>,
                  contractual arbitration clauses, regulators (FCA reporting lines, HSE, Trading Standards gateways, etc.).
                  The letter becomes exhibit one in bundles &mdash;
                  completeness now saves fees later.
                </p>

                <h2 id="short-version" class="consumer-page__subheading consumer-guide__h">The short version</h2>
                <p class="about-page__prose">
                  Think like someone reading cold: orderly facts, explicit loss, restrained reference to statutory rights where useful, unmistakable remedy and timetable. Aim for resolution rather than performance on social media.
                </p>
                <p class="about-page__prose">
                  <em>Nothing on this page is legal advice for your specific situation.</em>
                </p>`,
  },
  {
    slug: "ombudsman-schemes-explained",
    title: "How to use an ombudsman — which schemes exist and what they can actually do",
    desc: "Financial, energy, property, telecoms and other UK ombudsman routes: jurisdiction, limits and when court may suit you.",
    ogImage:
      "https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    breadcrumb: "Ombudsman schemes",
    eyebrowTopic: "Consumer rights",
    h1: "How to use an ombudsman &mdash; which schemes exist and what they can actually do",
    lede:
      "Sector ombudsmen can offer a free investigation and directions many firms must follow — coverage and caps vary; you usually complain to the trader first.",
    extraIntro: `
                <p class="about-page__prose">
                  If a business is digging in, an ombudsman can be a genuinely useful next step: the service is ordinarily <strong>free</strong> for the consumer, independent of the firm, and many schemes can produce outcomes the business must comply with if you accept them.
                  Coverage is not universal, remedies are capped and you usually have to complain to the trader first. This overview is for <strong>UK consumers</strong>; it is <strong>general information only</strong>, not advice on your complaint.
                </p>`,
    heroSrc:
      "https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    heroAlt: "Gavel beside sound block (stock photograph).",
    heroCaption: "Photo: Pexels (court / disputes).",
    toc: [
      ["#what-ombudsman", "What is an ombudsman?"],
      ["#sectors", "Which schemes cover which sectors"],
      ["#cannot-do", "What they cannot do"],
      ["#make-complaint", "How to make a complaint"],
      ["#worth-it", "Is it worth it?"],
      ["#short-version", "The short version"],
      ["#consumer-more", "All consumer resources"],
    ],
    body: `
                <h2 id="what-ombudsman" class="consumer-page__subheading consumer-guide__h">What is an ombudsman?</h2>
                <p class="about-page__prose">
                  An ombudsman investigates complaints between consumers and participating businesses in a particular sector. Funding often comes from industry levies, which makes some people sceptical, but the main schemes operate with real day-to-day independence in practice.
                  The key point for you is zero consumer fee, a structured investigation and, in many schemes, a <strong>binding direction on the business</strong> if you accept the final decision —
                  whereas you usually keep the option to reject and pursue court instead depending on scheme rules (read the small print for the route you use).
                </p>

                <h2 id="sectors" class="consumer-page__subheading consumer-guide__h">Which ombudsmen cover which sectors</h2>
                <p class="about-page__prose">
                  The Financial Ombudsman Service handles banks, insurers, mortgage lenders, many investment advisers, debt collectors falling within perimeter rules and adjacent topics &mdash;
                  broadly anything within <abbr title="Financial Conduct Authority">FCA</abbr> jurisdiction articulated on
                  <a href="https://www.financial-ombudsman.org.uk/" rel="noopener noreferrer">financial-ombudsman.org.uk</a>.
                  Monetary award limits are fixed in rules and <strong>revised from time to time</strong> &mdash;
                  verify the figures on their site before negotiating.
                </p>
                <p class="about-page__prose">
                  The Energy Ombudsman covers domestic and micro-business energy disputes once internal complaints processes stalemate (typical cooling-off timelines apply).
                  Communications grievances normally route via either an industry ADR provider such as CISAS / Ombudsman Services: Communications arrangements or whichever approved scheme your mobile or broadband carrier joined &mdash;
                  Ofcom publishes signposting hubs worth consulting before lodging forms.
                  The Property Ombudsman and Property Redress Scheme handle sales and letting agents subscribing to mandatory redress regimes.
                  The Furniture &amp; Home Improvement Ombudsman covers retailers and installers in those sectors who have signed up &mdash;
                  not all traders have joined, which limits coverage.
                  The Legal Ombudsman handles complaints about the <strong>service</strong> solicitors, barristers and certain other regulated lawyers provided &mdash;
                  not second-guessing whether the legal advice on the merits was right or wrong in the abstract.
                  The Pensions Ombudsman covers workplace and personal pension administration complaints within its remit.
                  The Parliamentary and Health Service Ombudsman covers complaints about some government departments and the NHS subject to eligibility and referral rules quite different from commercial ADR schemes.
                  Schemes and membership rules change; confirm the position on the official website before you rely on a particular route.
                </p>

                <h2 id="cannot-do" class="consumer-page__subheading consumer-guide__h">What they cannot do</h2>
                <p class="about-page__prose">
                  Ombudsmen are not courts: they do not send bailiffs or grant freezing orders themselves. If a firm that is bound by a decision still drags its feet, enforcing that outcome may mean going to court &mdash;
                  though that is unusual for firms that care about their regulatory standing.
                  Each scheme has compensation <strong>caps</strong>; verify the current limit for yours. For very large losses, County Court or High Court litigation may still fit better.
                  If the trader is not within a scheme&rsquo;s jurisdiction (for example where membership is voluntary and it never signed up), the ombudsman simply cannot take the case.
                  You are also usually expected to have complained to the business first and allowed a fair time to respond &mdash;
                  often around eight weeks unless the scheme says otherwise.
                </p>

                <h2 id="make-complaint" class="consumer-page__subheading consumer-guide__h">How to make a complaint</h2>
                <p class="about-page__prose">
                  Use each portal&rsquo;s digital forms where available; summarise chronology crisply (
                  mirror <a href="/consumer/formal-complaint-letter-gets-response">our complaint-letter guide</a> principles), upload correspondence packs, nominate preferred outcomes, cooperate with investigator questions.
                  Timelines vary — straightforward banking disputes might conclude within months whereas pension cases can creep longer.
                  Accept or reject outcomes consciously: acceptance usually forecloses rerun through the scheme but check rules with care.
                </p>

                <h2 id="worth-it" class="consumer-page__subheading consumer-guide__h">Is it worth it?</h2>
                <p class="about-page__prose">
                  For eligible complaints touching regulated participants, trying an ombudsman <em>before</em> court often saves cost and bother.
                  Higher-value or highly technical disputes may still be better routed to solicitors and litigation from the outset.
                </p>

                <h2 id="short-version" class="consumer-page__subheading consumer-guide__h">The short version</h2>
                <p class="about-page__prose">
                  Ombudsman routes are among the most practical tools consumers have where a scheme covers their sector &mdash;
                  but they are not universal, and award limits and procedure matter. Check you are in the right scheme before you invest time in a form.
                </p>
                <p class="about-page__prose">
                  <em>Nothing on this page is legal advice for your specific situation.</em>
                </p>`,
  },
  {
    slug: "letter-before-action-ai-risks",
    title: "The dangers of using AI to write your letter before action",
    desc:
      "Why AI drafts of letters before action can misstate facts, cite the wrong law or harm credibility — and safer approaches.",
    ogImage:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    breadcrumb: "Letter before action and AI",
    eyebrowTopic: "Court and disputes",
    h1: "The dangers of using AI to write your letter before action",
    lede:
      "Legal-sounding text in seconds feels powerful. Before relying on AI for formal pre-litigation correspondence, weigh accuracy, tactics and reputational fallout.",
    extraIntro: `
                <p class="about-page__prose">
                  AI tools have made it easier than ever to draft legal-sounding documents. Type in a few details about your dispute and within seconds you have something that looks professional, uses the right terminology,
                  and feels as though it means business. For a <strong>letter before action</strong> — the formal letter you typically send before starting court proceedings in <strong>England and Wales</strong> —
                  that can be genuinely tempting. There are real risks in relying on AI for this, worth understanding before you send something that could damage your position rather than strengthen it. This page is
                  <strong>general information only</strong>; it is not legal advice.
                </p>`,
    heroSrc:
      "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&amp;cs=tinysrgb&amp;w=1200",
    heroAlt: "Laptop displaying code-like text (stock photograph).",
    heroCaption: "Photo: Pexels (laptop workspace).",
    toc: [
      ["#what-lba-does", "What a letter before action actually does"],
      ["#ai-goes-wrong", "Where AI tends to go wrong"],
      ["#consequences", "The consequences of getting it wrong"],
      ["#not-against-ai", "This is not an argument against AI at all"],
      ["#instead", "What you should do instead"],
      ["#short-version", "The short version"],
      ["#consumer-more", "All consumer resources"],
    ],
    body: `
                <h2 id="what-lba-does" class="consumer-page__subheading consumer-guide__h">What a letter before action actually does</h2>
                <p class="about-page__prose">
                  A letter before action is not just a strongly worded complaint. It is a formal step in the legal process. Courts expect sensible attempts to settle or exchange key information before starting a claim. The
                  <a href="https://www.justice.gov.uk/courts/procedure-rules/civil" rel="noopener noreferrer">Civil Procedure Rules</a>
                  include <strong>pre-action protocols</strong> that set behavioural expectations depending on the type of dispute &mdash;
                  how you write earlier letters can matter later when conduct and costs are considered.
                  A sound letter sets out what happened clearly, outlines the basis for your demand, states what you want and by when, and gives the other side a fair chance to respond before litigation.
                  It shows you understand your position and have tried proportionate routes first. <strong>Poor wording or a misstated legal basis can do the opposite.</strong>
                </p>

                <h2 id="ai-goes-wrong" class="consumer-page__subheading consumer-guide__h">Where AI tends to go wrong</h2>
                <p class="about-page__prose">
                  <strong>It sounds right without being right.</strong> AI produces text that reads authoritative and familiar in legal wording, neat layout and convincing tone —
                  yet confident-sounding prose and legally accurate content are different things altogether.
                </p>
                <p class="about-page__prose">
                  <strong>It does not know your facts.</strong> Letters before action stand or fall on the specifics — dates, amounts, what was agreed, what broke down, what you can prove —
                  AI only works from whatever you typed; gaps or mildly wrong framing propagate into the draft, often unprompted.
                </p>
                <p class="about-page__prose">
                  <strong>It may state the wrong legal basis.</strong> Consumer statutes, contractual rights and negligence-based claims occupy different compartments with different hurdles;
                  generators may cite the wrong enactment or ignore the pathway you actually intend. You may only notice once the opponent&rsquo;s reply exposes inconsistencies.
                </p>
                <p class="about-page__prose">
                  <strong>It can skew tone unfairly.</strong> Too blistering invites allegations of unreasonable conduct; too weak offers no spur to negotiate. Boilerplate drafts rarely gauge your counterparty realistically.
                </p>
                <p class="about-page__prose">
                  <strong>It can assert what you cannot prove.</strong> Bold statements about dishonesty or systematic misconduct land badly under challenge without proof —
                  harming credibility early.
                </p>

                <h2 id="consequences" class="consumer-page__subheading consumer-guide__h">The consequences of getting it wrong</h2>
                <p class="about-page__prose">
                  <strong>Conduct matters in litigation.</strong> Mischaracterising relief, alleging facts you cannot substantiate or ignoring obligatory pre-action behaviour can haunt costs rulings —
                  occasionally even alongside winning on substantive points. Conversely, clumsy prose may signal misunderstanding to your counterpart, lengthening hostility.
                  Committing prematurely to reasons you abandon later breeds inconsistency that opponents exploit when particulars finally land.
                </p>

                <h2 id="not-against-ai" class="consumer-page__subheading consumer-guide__h">This is not an argument against AI at all</h2>
                <p class="about-page__prose">
                  AI can clarify general concepts, help structure a chronology, or suggest angles you later verify with statutes and caselaw. Using it to think is sharply different from treating its output as a final letter stamped and posted without sober review tailored to disclosure you hold.
                </p>

                <h2 id="instead" class="consumer-page__subheading consumer-guide__h">What you should do instead</h2>
                <p class="about-page__prose">
                  For smaller disputes, often a plain-language letter &mdash;
                  orderly facts, specific relief, workable deadline &mdash;
                  achieves more than pasted statutory theatre. See <a href="/consumer/formal-complaint-letter-gets-response">our guide to effective complaint drafting</a>.
                  For higher stakes, unusual defences or complex proofs, budgeting time (and regulated adviser fees where appropriate) before locking onto a disputed narrative usually pays dividends. Our
                  <a href="/articles/small-claims-court">small claims overview</a> outlines how escalating works financially.
                  Remember adjudicators routinely see correspondence first — fidelity then matters enormously.
                </p>

                <h2 id="short-version" class="consumer-page__subheading consumer-guide__h">The short version</h2>
                <p class="about-page__prose">
                  AI-generated letters before action often look persuasive yet hide mis-cited bases, unsupported assertions or clumsy tonal misjudgements threatening leverage before court fees even arise —
                  brainstorming with models is prudent; blindly posting their letter is perilous without careful human grounding.
                </p>
                <p class="about-page__prose">
                  <em>Nothing on this page is legal advice for your specific situation.</em>
                </p>`,
  },
];

function buildMiddle(cfg) {
  const tocLi = cfg.toc.map(([href, label]) => `                <li><a href="${href}">${label}</a></li>`).join("\n");
  let introHorse = "";
  if (cfg.slug === "horse-injury-on-your-land-liability") {
    introHorse = `
                <p class="about-page__prose">
                  Horses are large, unpredictable animals. Even well-managed ones can bite, kick or spook without warning. If someone is injured on your land as a result, who is legally responsible is not always simple.
                  Several overlapping rules apply and the precise facts matter. This guide is general information about <strong>England and Wales</strong> only; it is not <strong>legal advice</strong>.
                </p>`;
  } else if (cfg.slug === "deposits-when-refundable") {
    introHorse = `
                <p class="about-page__prose">
                  Paying a deposit feels routine. You hand over a percentage of the price to secure something &mdash; a venue, a tradesperson, a horse, a holiday &mdash; and assume the rest will follow. When things fall through,
                  whether you get that money back catches a lot of people off guard.
                  This page is general information for <strong>England and Wales</strong> only; it is <strong>not legal advice</strong>.
                </p>`;
  } else if (cfg.extraIntro) {
    introHorse = cfg.extraIntro;
  }

  return `
          <nav class="consumer-page__breadcrumb consumer-guide__breadcrumb" aria-label="Breadcrumb">
            <ol class="consumer-page__breadcrumb-list consumer-guide__breadcrumb-list">
              <li class="consumer-page__breadcrumb-item">
                <a href="/" class="consumer-page__breadcrumb-link consumer-guide__crumb">
                  <span class="consumer-guide__crumb-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
                    </svg>
                  </span>
                  Home
                </a>
              </li>
              <li class="consumer-page__breadcrumb-item">
                <a href="/consumer" class="consumer-page__breadcrumb-link consumer-guide__crumb">Consumer</a>
              </li>
              <li class="consumer-page__breadcrumb-item consumer-page__breadcrumb-item--current" aria-current="page">
                <span class="consumer-page__breadcrumb-current consumer-guide__crumb consumer-guide__crumb--current"
                  >${cfg.breadcrumb}</span
                >
              </li>
            </ol>
          </nav>

          <header class="consumer-guide__hero">
            <div class="consumer-guide__hero-copy">
              <p class="consumer-guide__eyebrow">
                <span class="consumer-guide__eyebrow-dot" aria-hidden="true"></span>
                Consumer resource${cfg.eyebrowTopic ? ` &middot; ${cfg.eyebrowTopic}` : ""}
              </p>
              <h1 class="consumer-guide__title about-page__title about-page__title--page">
                ${cfg.h1}
              </h1>
              <p class="consumer-guide__lede">
                ${cfg.lede}
              </p>
            </div>
            <figure class="consumer-guide__hero-figure">
              <img
                src="${cfg.heroSrc}"
                alt="${cfg.heroAlt.replace(/"/g, "&quot;")}"
                width="1200"
                height="800"
                loading="eager"
                decoding="async"
                class="consumer-guide__hero-img"
              />
              <figcaption class="consumer-guide__hero-caption">${cfg.heroCaption}</figcaption>
            </figure>
          </header>

          <div class="consumer-guide__shell">
            <nav class="consumer-guide__toc" aria-labelledby="consumer-guide-toc-heading">
              <p id="consumer-guide-toc-heading" class="consumer-guide__toc-heading">On this page</p>
              <ol class="consumer-guide__toc-list">
${tocLi}
              </ol>
            </nav>
            <div class="consumer-guide__main">
              <div class="consumer-guide__callout" role="note">
                <div class="consumer-guide__callout-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div class="consumer-guide__callout-body">
                  <p class="consumer-guide__callout-title">Jurisdiction &amp; nature of this page</p>
                  <p class="consumer-guide__callout-text">
                    This guide reflects general information about <strong>England and Wales</strong> and is not legal advice. We are
                    <strong>not a law firm</strong>.
                  </p>
                </div>
              </div>
              <div class="about-page__body consumer-guide__body">
${introHorse}
${cfg.body}

                <p id="consumer-more" class="about-page__prose consumer-page__back consumer-guide__back">
                  <a href="/consumer">All consumer resources</a>
                </p>
              </div>
            </div>
          </div>`;
}

const blockRe =
  /<nav class="consumer-page__breadcrumb consumer-guide__breadcrumb"[\s\S]*?<p id="consumer-more" class="about-page__prose consumer-page__back consumer-guide__back">\s*<a href="\/consumer">All consumer resources<\/a>\s*<\/p>/;

for (const cfg of pages) {
  let html = swapHead(tmpl, cfg);
  const middle = buildMiddle(cfg);
  if (!blockRe.test(html)) throw new Error("Template block not found");
  html = html.replace(blockRe, middle);
  const out = path.join(root, "consumer", `${cfg.slug}.html`);
  fs.writeFileSync(out, html, "utf8");
  console.log("Wrote", path.relative(root, out));
}
