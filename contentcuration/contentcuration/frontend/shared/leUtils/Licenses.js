// Constant values for Licenses sorted by id
const LicensesMap = new Map([
  [
    1,
    {
      id: 1,
      license_name: 'CC BY',
      exists: true,
      license_url: 'https://creativecommons.org/licenses/by/4.0/',
      license_description:
        'The Attribution License lets others distribute, remix, tweak, and build upon your work, even commercially, as long as they credit you for the original creation. This is the most accommodating of licenses offered. Recommended for maximum dissemination and use of licensed materials.',
      copyright_holder_required: true,
      is_custom: false,
    },
  ],
  [
    2,
    {
      id: 2,
      license_name: 'CC BY-SA',
      exists: true,
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
      license_description:
        'The Attribution-ShareAlike License lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to "copyleft" free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.',
      copyright_holder_required: true,
      is_custom: false,
    },
  ],
  [
    3,
    {
      id: 3,
      license_name: 'CC BY-ND',
      exists: true,
      license_url: 'https://creativecommons.org/licenses/by-nd/4.0/',
      license_description:
        'The Attribution-NoDerivs License allows for redistribution, commercial and non-commercial, as long as it is passed along unchanged and in whole, with credit to you.',
      copyright_holder_required: true,
      is_custom: false,
    },
  ],
  [
    4,
    {
      id: 4,
      license_name: 'CC BY-NC',
      exists: true,
      license_url: 'https://creativecommons.org/licenses/by-nc/4.0/',
      license_description:
        "The Attribution-NonCommercial License lets others remix, tweak, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don't have to license their derivative works on the same terms.",
      copyright_holder_required: true,
      is_custom: false,
    },
  ],
  [
    5,
    {
      id: 5,
      license_name: 'CC BY-NC-SA',
      exists: true,
      license_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      license_description:
        'The Attribution-NonCommercial-ShareAlike License lets others remix, tweak, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms.',
      copyright_holder_required: true,
      is_custom: false,
    },
  ],
  [
    6,
    {
      id: 6,
      license_name: 'CC BY-NC-ND',
      exists: true,
      license_url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
      license_description:
        "The Attribution-NonCommercial-NoDerivs License is the most restrictive of our six main licenses, only allowing others to download your works and share them with others as long as they credit you, but they can't change them in any way or use them commercially.",
      copyright_holder_required: true,
      is_custom: false,
    },
  ],
  [
    7,
    {
      id: 7,
      license_name: 'All Rights Reserved',
      exists: true,
      license_url: 'http://www.allrights-reserved.com/',
      license_description:
        'The All Rights Reserved License indicates that the copyright holder reserves, or holds for their own use, all the rights provided by copyright law under one specific copyright treaty.',
      copyright_holder_required: true,
      is_custom: false,
    },
  ],
  [
    8,
    {
      id: 8,
      license_name: 'Public Domain',
      exists: true,
      license_url: 'https://creativecommons.org/publicdomain/mark/1.0/',
      license_description:
        'Public Domain work has been identified as being free of known restrictions under copyright law, including all related and neighboring rights.',
      copyright_holder_required: false,
      is_custom: false,
    },
  ],
  [
    9,
    {
      id: 9,
      license_name: 'Special Permissions',
      exists: false,
      license_url: '',
      license_description:
        'Special Permissions is a custom license to use when the current licenses do not apply to the content. The owner of this license is responsible for creating a description of what this license entails.',
      copyright_holder_required: true,
      is_custom: true,
    },
  ],
]);

export default LicensesMap;

export const LicensesList = Array.from(LicensesMap.values());
