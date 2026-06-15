const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// AppCheckCore 11.3.0+ (Swift, pulled transitively by GoogleSignIn 9.1.0 via
// @react-native-google-signin) cannot integrate as a static library unless its
// dependencies GoogleUtilities / RecaptchaInterop generate module maps.
// EAS regenerates the Podfile on every build (ios/ is gitignored), so we inject
// the modular_headers fix here instead of editing the Podfile by hand.
const POD_LINES = [
  "  pod 'GoogleUtilities', :modular_headers => true",
  "  pod 'RecaptchaInterop', :modular_headers => true",
].join('\n');

const MARKER = "pod 'GoogleUtilities', :modular_headers => true";

module.exports = function withGoogleModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile'
      );
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (!contents.includes(MARKER)) {
        // Insert right after `use_expo_modules!` inside the main target block.
        contents = contents.replace(
          /^(\s*use_expo_modules!\s*)$/m,
          `$1\n${POD_LINES}\n`
        );
        fs.writeFileSync(podfilePath, contents);
      }

      return config;
    },
  ]);
};
