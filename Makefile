NAME    = VirtualList
SOURCES = $(wildcard src/*.js)
SPECS   = $(wildcard spec/*.js)

ES5_SOURCES = $(SOURCES:src/%.js=dist/%.js)
ES5_SPECS   = $(SPECS:spec/%.js=dist/spec/%.js)

default: spec

$(NAME): $(ES5_SOURCES)

dist/$(NAME).js: $(SOURCES)
	./node_modules/.bin/webpack --output-file $@

dist/$(NAME).min.js: $(SOURCES)
	./node_modules/.bin/webpack -p --output-file $@

dist/%.js: src/%.js
	@mkdir -p dist
	./node_modules/.bin/babel $< -o $@

dist/spec/%.js: spec/%.js
	mkdir -p dist/spec
	./node_modules/.bin/babel $< -o $@

dist: $(NAME) dist/$(NAME).js dist/$(NAME).min.js

SPEC ?=
spec_node: $(NAME) $(ES5_SPECS)
	./node_modules/.bin/jasmine $(SPEC)

spec_browser: $(NAME) $(ES5_SPECS)
	./node_modules/karma/bin/karma start ./karma.config.js

spec: spec_node spec_browser

clean:
	rm -rf ./dist

.PHONY: $(NAME) default clean spec spec_node spec_browser dist
