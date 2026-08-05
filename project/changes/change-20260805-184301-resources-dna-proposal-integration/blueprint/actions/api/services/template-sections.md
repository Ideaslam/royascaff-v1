# Service Delta — Template Sections (team + partners)

## Files modified
- `src/pipeline-v3/templates/pitch-landscape/pitch-landscape.catalog.ts`
- `src/pipeline-v3/templates/roya-presentation/roya-presentation.catalog.ts`
- `src/pipeline-v3/templates/shared/section-schema-helpers.ts` (if needed)

## Files created
- `roya-sales-ai-api-v2/templates/pitch-landscape/v1/partials/team.hbs`
- `roya-sales-ai-api-v2/templates/pitch-landscape/v1/partials/partners.hbs`
- `roya-sales-ai-api-v2/templates/roya-presentation/v1/partials/partners.hbs`

## Add to pitch-landscape catalog: `team` section

Same definition as roya-presentation's `team` but with pitch-landscape styling:

```typescript
{
  key: "team",
  name: { ar: "فريق العمل", en: "Team" },
  purpose: "Delivery team / roles for the engagement — grounded in resources catalog",
  whenToUse: "After methodology when team resources are selected",
  researchKeys: [] as string[],
  repeatable: true,
  pages: { min: 1, max: 2 },
  contentSchema: {
    type: "object",
    required: ["title", "members"],
    properties: {
      title: textSchema(4, 60),
      intro: textSchema(0, 280),
      members: {
        type: "array",
        minItems: 1,
        maxItems: 8,
        items: {
          type: "object",
          required: ["name", "role"],
          properties: {
            name: textSchema(2, 80),
            role: textSchema(2, 60),
            focus: textSchema(8, 200),
            photo: textSchema(0, 500),
          },
        },
      },
    },
  },
}
```

Insert after `methodology` section (same position as roya-presentation).

## Add to both catalogs: `partners` section

```typescript
{
  key: "partners",
  name: { ar: "الشركاء", en: "Partners" },
  purpose: "Strategic partners supporting the engagement — grounded in resources catalog",
  whenToUse: "When partner resources are selected",
  researchKeys: [] as string[],
  repeatable: true,
  pages: { min: 1, max: 2 },
  contentSchema: {
    type: "object",
    required: ["title", "partners"],
    properties: {
      title: textSchema(4, 60),
      intro: textSchema(0, 280),
      partners: {
        type: "array",
        minItems: 1,
        maxItems: 6,
        items: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: textSchema(2, 80),
            description: textSchema(8, 300),
            logo: textSchema(0, 500),
            specialization: textSchema(0, 120),
          },
        },
      },
    },
  },
}
```

Insert after `team` section in both catalogs.

## Modify: roya-presentation `team` section

Update content schema to include `name` and `photo` fields (currently only `role` + `focus`):

```typescript
members: {
  items: {
    required: ["name", "role"],
    properties: {
      name: textSchema(2, 80),       // ← new
      role: textSchema(2, 60),
      focus: textSchema(8, 200),
      deliverables: textSchema(0, 160),
      photo: textSchema(0, 500),     // ← new
    },
  },
},
```

## HBS Partials

### team.hbs (pitch-landscape)

```handlebars
<section class="page">
  <div class="slide-content">
    <h2>{{content.title}}</h2>
    {{#if content.intro}}<p class="intro">{{content.intro}}</p>{{/if}}
    <div class="content grid-2">
      {{#each content.members}}
      <div class="card team-card">
        {{#if this.photo}}<img src="{{this.photo}}" class="team-photo" alt="{{this.name}}" />{{/if}}
        <h3>{{this.name}}</h3>
        <span class="role">{{this.role}}</span>
        <p>{{this.focus}}</p>
      </div>
      {{/each}}
    </div>
  </div>
</section>
```

### partners.hbs (both templates)

```handlebars
<section class="page">
  <div class="slide-content">
    <h2>{{content.title}}</h2>
    {{#if content.intro}}<p class="intro">{{content.intro}}</p>{{/if}}
    <div class="content grid-3">
      {{#each content.partners}}
      <div class="card partner-card">
        {{#if this.logo}}<img src="{{this.logo}}" class="partner-logo" alt="{{this.name}}" />{{/if}}
        <h3>{{this.name}}</h3>
        {{#if this.specialization}}<span class="spec">{{this.specialization}}</span>{{/if}}
        <p>{{this.description}}</p>
      </div>
      {{/each}}
    </div>
  </div>
</section>
```

### Modify: roya-presentation team.hbs

Update to include `name` and optional `photo`:

```handlebars
<div class="hp-team-card">
  {{#if this.photo}}<img src="{{this.photo}}" class="hp-team-photo" alt="{{this.name}}" />{{/if}}
  <h3>{{this.name}}</h3>
  <span class="hp-role">{{this.role}}</span>
  <p>{{this.focus}}</p>
</div>
```

## Section AI behavior

- **team**: AI writes `focus` and optional `deliverables` using resource's `summary` + `data` fields. `name` and `photo` are passed through from resource snapshot (code-owned). If no team resources selected → AI invents members (existing fallback).
- **partners**: AI writes `description` using resource's `summary` + `data`. `name` and `logo` are passthrough. If no partners selected → section omitted from map.

## Map integration

In `MapOrchestratorService`, conditionally include `team` / `partners` sections based on resource availability:

```typescript
const resourceItems = Array.isArray((dna.resources as JsonObject)?.items)
  ? ((dna.resources as JsonObject).items as JsonObject[])
  : [];
const hasTeam = resourceItems.some((r) => String(r.typeKey) === 'team-member');
const hasPartners = resourceItems.some((r) => String(r.typeKey) === 'partner');
```

When building the map prompt's available sections, include `team` if `hasTeam` or template supports AI fallback; include `partners` only if `hasPartners`.
