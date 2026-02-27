SHELL := /bin/bash

N ?= 1
INTERVAL ?= 3

.PHONY: loop-start loop-check loop-assemble watch-run watch-tick watch-status watch-reset

loop-start:
	./ops/bin/loop.sh start $(N)

loop-check:
	./ops/bin/loop.sh check $(N)

loop-assemble:
	./ops/bin/loop.sh assemble $(N)

watch-run:
	./ops/bin/watch-loop.sh run $(N) $(INTERVAL)

watch-tick:
	./ops/bin/watch-loop.sh tick $(N)

watch-status:
	./ops/bin/watch-loop.sh status $(N)

watch-reset:
	./ops/bin/watch-loop.sh reset $(N)
