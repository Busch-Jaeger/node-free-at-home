Library for free@home local device api

This api is unstable.

#Install

##Prepare for local developement

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