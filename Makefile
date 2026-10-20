.PHONY: dev lint test build

dev:
	pnpm dev

lint:
	pnpm lint

test:
	pnpm types:check
	pnpm test

build:
	pnpm build
