# hobby-mvcc-framework
A hobby js model-view-controller-coordinator framework for canvas ui applications

## Biggest Issues

 - `super` methods must be called by manually by classes that make use of
  framework classes. Additionally, there's not really any standardization of
  where in the method order to call `super`, either before subclass work or
  after.

## Target for Improvement

### Trivial

 - Documentation

### Challenging

 - Rendering to offscreen canvas, and rendering only if the model has changed
  since last render. This will involve some method of the model being able to
  report whether it's changed. Maybe a hash of some kind that the view can keep
  track of? Like a receipt of rendering. If the current receipt hasn't changed,
  the view can simply render the saved offscreen canvas rather than rendering
  from scratch. This would increase performance while idling.

 - Multiple Canvas layers, both for performance and utility reasons.

### Difficult

## "Compilation"

All framework code resides in the `src/` folder. Technically any part of the
Framework could be loaded and used idividually, but for convenience sake a
script called `bundle.sh` can be called to concatenate all the files into a
single file called `MVCC.js`. For now, that's litterally all the script does.
In the future this will likely be someone more involved.

## Usage
