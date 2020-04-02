#!/usr/bin/env bash
# Note this assumes all the following folders are shallow.
# For now this just packs all the framework files into a single one for
# portability.
cat js/application/* js/controller/* js/coordinator/* js/model/* js/ui/* > MVCC.js
cat css/* MVCC.css