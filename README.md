Library for free@home local device api

This api is unstable.

# Install

Npm packages for this project are avalible [here](http://10.3.101.26:4873/-/web/detail/free-at-home).

To install this packages run:
```
npm install --registry http://10.3.101.26:4873 free-at-home
```

# Example

# Prepare for local developement

Change prefix to user writeble directory.
```
npm config set prefix ~/.npm
```

Install dependencies
```
npm install
```

Add link to local package
```
cd node-free-at-home
npm link
```

For the package that uses this library:
```
npm link free-at-home
```

Build projekt
```
npm run build
```