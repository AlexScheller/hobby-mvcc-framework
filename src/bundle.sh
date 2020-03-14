#!/usr/bin/env bash
# Note this assumes all the following folders are shallow.
# For now this just packs all the framework files into a single one for
# portability.
cat application/* controller/* coordinator/* model/* ui/* > MVCC.js