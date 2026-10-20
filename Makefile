.PHONY: dev lint test build

dev:
	pnpm dev

lint:
	pnpm lint

# No test runner yet; type-check stands in until tests exist.
test:
	pnpm types:check

build:
	pnpm build
