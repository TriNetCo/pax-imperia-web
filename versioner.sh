export REACT_APP_PAX_BUILD_VERSION=$(git diff-index --quiet HEAD && echo "$(git rev-parse HEAD)" || echo "$(git rev-parse HEAD)_dirty")
