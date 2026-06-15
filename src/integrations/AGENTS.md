# Integration Guidance

## Scope

This file applies to `src/integrations` except where a deeper `AGENTS.md` overrides it.

## Ownership

This subtree owns client-side access points to external systems and generated types that support those integrations.

## Boundaries

- Connection setup and generated types belong here.
- Pages and components may consume integrations from here, but should not reimplement connection setup.
- Keep integration-specific details localized so the rest of the app depends on stable import paths.

## References

- `docs/architecture/data-access.md`
- `docs/architecture/repo-layout.md`
