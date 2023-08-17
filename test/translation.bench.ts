import { LocaleKit } from "../mod.ts";

const demo_language = {
  common: {
    "register": "Register",
    "login": "Login",
    "logout": "Logout",
    "profile": "Profile",
    "settings": "Settings",
    "home": "Home",
    "search": "Search",
    "search_placeholder": "Search...",
  },
  home: {
    header: "Lorem Ipsum",
    subtitle: "Donec mattis vehicula mi at dignissim",
    welcome:
      "Quisque efficitur cursus metus, at auctor odio luctus fermentum. In finibus dignissim dolor, vel faucibus lacus lacinia in. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vivamus diam quam, varius ac consequat non, dignissim non leo. Duis ante justo, venenatis id consectetur in, porttitor ac turpis. Integer eleifend sagittis posuere. Aliquam leo sapien, mattis ut sollicitudin quis, tempus vitae justo. Fusce feugiat et felis at cursus. Nullam felis ipsum, varius a augue sed, porta porta sem. Cras ultrices dui justo, eu pharetra nunc dictum id. Praesent et feugiat neque, in convallis sapien. Proin hendrerit ipsum in orci luctus sagittis sit amet sed neque. Etiam malesuada tortor quis lacus facilisis, ac ultricies libero efficitur. Phasellus tincidunt magna dolor, in tempor ex lacinia porta. Fusce tellus ipsum, tristique a elementum vitae, venenatis id mauris.",
    // Populate common text parts of a home page including multiple paragraphs
    // and a list of items
    section_1: {
      title: "Integer ut sem velit",
      subtitle: "In fermentum consectetur imperdiet",
      description:
        "Sed eget magna nisi. Vivamus ultricies ex luctus venenatis dapibus. Maecenas vitae pretium nisl. Phasellus pharetra interdum nulla, quis varius felis sodales vitae. Integer at consectetur purus. Donec rutrum nisi at elit finibus, non consectetur nisl viverra. Quisque ac scelerisque nunc. Fusce purus odio, dictum eget tortor id, porta mattis elit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam luctus viverra pulvinar. Praesent pretium mauris at tellus ornare sollicitudin. Cras vel pulvinar leo, eu semper justo. Nunc tempor posuere aliquet. Etiam molestie, nibh quis ultrices vestibulum, urna tortor placerat ex, vitae cursus dui eros sit amet tellus. Morbi nunc dui, rhoncus sit amet lorem quis, molestie scelerisque massa. Sed sit amet elit et quam pharetra scelerisque ultricies non dolor.",
    },
    section_2: {
      title: "Vivamus molestie",
      subtitle: "Fusce id fringilla ante",
      description:
        "Ut vitae finibus augue. Mauris magna nibh, scelerisque ut lacus vitae, finibus aliquet lorem. Quisque finibus blandit luctus. Fusce laoreet sapien vel metus ultrices, eget porttitor augue feugiat. Proin rutrum dignissim congue. Donec volutpat faucibus commodo. Curabitur ultrices vitae libero sed finibus. Sed et eros velit. Nulla facilisi.",
    },
    dynamic: {
      "title": "Dynamic title",
      "subtitle": "Dynamic subtitle",
      "with_substitution":
        "This is a demo showing the various dynamic replacement options: {{val}}",
      "with_localisation_and_substitution":
        `This is a demo showing the various dynamic replacement options: [[~
        {val}
        EQ(num: 0): ;:Equals zero {{val}}:;
        | LT(num: 0): ;:Less than zero {{val}}:;
        | LTE(num: 2): ;:Less than or equal to 2 {{val}}:;
        | BT(num: 2, num: 5): ;:Between 2 and 5 {{val}}:;
        | IN(key: {arr}): ;:In array [6, 7, 8, 9, 10] {{val}}:;
        | GT(num: 20): ;:Greater than 20 {{val}}:;
        | default: ;:Default {{val}}:;
      ]]`,
      "with_localisation":
        `This is a demo showing the various dynamic replacement options: [[~
        {val}
        EQ(num: 0): ;:Equals zero:;
        | LT(num: 0): ;:Less than zero:;
        | LTE(num: 2): ;:Less than or equal to 2:;
        | BT(num: 2, num: 5): ;:Between 2 and 5:;
        | IN(key: {arr}): ;:In array [6, 7, 8, 9, 10]:;
        | GT(num: 20): ;:Greater than 20:;
        | default: ;:Default:;
      ]]`,
    },
  },
};

const demo_locale = new LocaleKit();

demo_locale.addLanguage("en", demo_language);

// Add a language
Deno.bench({
  name: "Add language",
  fn: () => {
    const locale = new LocaleKit();

    locale.addLanguage("en", demo_language);
  },
});

// Get a specific key
Deno.bench({
  name: "Get a specific key",
  fn: () => {
    demo_locale.getKey("en", "home.header");
  },
});

// Translate a key
Deno.bench({
  name: "Translate a key",
  fn: () => {
    demo_locale.t("home.header");
  },
});

// Translate a key with a substitution
Deno.bench({
  name: "Translate a key with a substitution",
  fn: () => {
    demo_locale.t("home.dynamic.with_substitution", { val: 5 });
  },
});

// Translate a key with a substitution and localisation
Deno.bench({
  name: "Translate a key with a substitution and localisation",
  fn: () => {
    demo_locale.t("home.dynamic.with_localisation_and_substitution", {
      val: 5,
      arr: [6, 7, 8, 9, 10],
    });
  },
});

// Translate a key with localisation
Deno.bench({
  name: "Translate a key with localisation",
  fn: () => {
    demo_locale.t("home.dynamic.with_localisation", {
      val: 5,
      arr: [6, 7, 8, 9, 10],
    });
  },
});
