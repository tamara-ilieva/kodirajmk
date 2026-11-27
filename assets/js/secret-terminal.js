(() => {
  "use strict";
  const { base, element } = Kodiraj;
  const { grant, icon } = KodirajSecrets;
  const { counter, floatFrog, whisper, showBugs, addMascot } = KodirajEggs;
  const roomLink = () => {
    const link = element("a", "Developer room");
    link.href = new URL("secret/", base);
    return link;
  };
  const replies = {
    "sudo make me a sandwich": (print) => print(icon("sandwich"), " Your pixel sandwich."),
    "sudo make coffee": (print) => { print(icon("cup"), " Fresh pixel coffee."); grant("coffee"); },
    "rm -rf /": (print) => print("Nice try. The frog has backups."),
    "git blame": (print) => print("It was the frog."),
    "git push --force": (print) => print("Your senior developer is typing..."),
    "exit vim": (print) => print("Nobody knows how."),
    "42": (print) => print("The answer to life, the universe, and everything."),
    "hire me": (print) => print("You're already showing initiative."),
    "hello world": (print) => { print("Hello, developer."); grant("hello"); },
    "hack kodiraj": (print) => print("[FICTIONAL SECURITY ALERT]\nThe frog is watching you."),
    secret: (print) => {
      Kodiraj.unlock("terminal");
      print("Clue 3: HOPS · The frog left a door ajar: ", roomLink());
    },
    "make website": (print) => print("Still working on it. Someone keeps adding Easter eggs."),
    "import antigravity": (print) => { print("Gravity unavailable."); floatFrog(); },
    ribbit: (print) => { print("Крек. Пикселската жаба те поздравува."); whisper(); },
    debug: (print) => { print("Bug report: 10 unassigned issues."); showBugs(); },
    matrix: (print) => { print("Wake up, developer..."); addMascot(); KodirajThemes.matrix(true); }
  };
  window.KodirajSecretTerminal = {
    run(command, print) {
      if (!Object.hasOwn(replies, command)) return false;
      replies[command](print);
      return true;
    },
    count() {
      const commandCount = counter("commands");
      if (commandCount >= 20) grant("addict");
      return commandCount % 5 === 0;
    }
  };
})();
