.PHONY: help install dev build lint format test clean

help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## 依存関係をインストール
	pnpm install

dev: ## 開発サーバーを起動
	pnpm dev

build: ## プロダクションビルド
	pnpm build

lint: ## ESLintを実行
	pnpm lint

format: ## Prettierでフォーマット
	pnpm exec prettier --write "**/*.{js,jsx,ts,tsx,json,md,css}"

type-check: ## TypeScriptの型チェック
	pnpm exec tsc --noEmit

test: lint type-check ## すべてのテストを実行

clean: ## 生成ファイルを削除
	rm -rf .next
	rm -rf node_modules
	rm -rf dist
