// ===========================================
// The Dragon's Quest - Text Adventure Game
// A progression-based learning project
// ===========================================

// Include readline for player input
const readline = require("readline-sync");

// Game state variables
let gameRunning = true;
let playerName = "";
let playerHealth = 100;
let playerGold = 20; // Starting gold
let currentLocation = "village";

// Monster/battle tuning
let monsterDefense = 5; // Base defense to offset player damage a bit

// ===========================
// Item Templates
// ===========================

// Potions
const healthPotion = {
  name: "Health Potion",
  type: "potion",
  value: 5, // Cost in gold
  effect: 30, // Healing amount
  description: "Restores 30 health points",
};

// Basic weapon
const sword = {
  name: "Sword",
  type: "weapon",
  value: 10, // Cost in gold
  effect: 10, // Damage amount
  description: "A sturdy blade for combat",
};

// NEW: Armor + Advanced gear (Task 1)
const woodenShield = {
  name: "Wooden Shield",
  type: "armor",
  value: 8,
  effect: 5,
  description: "Reduces damage taken in combat",
};

const steelSword = {
  name: "Steel Sword",
  type: "weapon",
  value: 25,
  effect: 20,
  description: "A razor-sharp blade that deals heavy damage",
};

const ironShield = {
  name: "Iron Shield",
  type: "armor",
  value: 16,
  effect: 10,
  description: "A sturdy shield that blocks more damage",
};

// Create empty inventory array
let inventory = []; // Stores item objects

// ===========================
// Helper: Items & Equipment (Task 1)
// ===========================

/**
 * Returns all items in inventory that match a given type ("weapon", "armor", "potion", ...)
 * @param {string} type
 * @returns {Array<object>}
 */
function getItemsByType(type) {
  return inventory.filter((item) => item.type === type);
}

/**
 * Returns the single best item (highest `effect`) of the given type, or null if none found
 * @param {string} type
 * @returns {object|null}
 */
function getBestItem(type) {
  const items = getItemsByType(type);
  if (items.length === 0) return null;
  return items.reduce((best, cur) => (cur.effect > best.effect ? cur : best), items[0]);
}

/**
 * Checks if the player has gear good enough to face the dragon:
 * - Requires the advanced weapon (Steel Sword) AND
 * - Any armor (wood/iron/etc.)
 * @returns {boolean}
 */
function hasGoodEquipment() {
  const hasSteel = inventory.some((i) => i.name === "Steel Sword" && i.type === "weapon");
  const anyArmor = !!getBestItem("armor");
  return hasSteel && anyArmor;
}

/**
 * Checks if player has an item of specified type
 * @param {string} type The type of item to check for
 * @returns {boolean} True if player has the item type
 */
function hasItemType(type) {
  return inventory.some((item) => item.type === type);
}

// ===========================
// Display Functions
// ===========================

/**
 * Shows the player's current stats
 */
function showStatus() {
  console.log("\n=== " + playerName + "'s Status ===");
  console.log("❤️  Health: " + playerHealth);
  console.log("💰 Gold: " + playerGold);
  console.log("📍 Location: " + currentLocation);

  console.log("🎒 Inventory: ");
  if (inventory.length === 0) {
    console.log("   Nothing in inventory");
  } else {
    inventory.forEach((item, index) => {
      console.log("   " + (index + 1) + ". " + item.name + " - " + item.description);
    });
  }

  const bestWeapon = getBestItem("weapon");
  const bestArmor = getBestItem("armor");
  console.log(
    "🗡️  Equipped (auto): " +
      (bestWeapon ? bestWeapon.name + " (+" + bestWeapon.effect + " dmg)" : "None")
  );
  console.log(
    "🛡️  Armor (auto): " +
      (bestArmor ? bestArmor.name + " (+" + bestArmor.effect + " prot)" : "None")
  );
}

/**
 * Shows the current location's description and available choices
 * (Task 3: expanded location options)
 */
function showLocation() {
  console.log("\n=== " + currentLocation.toUpperCase() + " ===");

  if (currentLocation === "village") {
    console.log("You're in a bustling village. The blacksmith and market are nearby. The mountains loom to the north.");
    console.log("\nWhat would you like to do?");
    console.log("1: Go to blacksmith");
    console.log("2: Go to market");
    console.log("3: Enter forest");
    console.log("4: Travel to the mountains (Dragon)");
    console.log("5: Check status");
    console.log("6: Use item");
    console.log("7: Help");
    console.log("8: Quit game");
  } else if (currentLocation === "blacksmith") {
    console.log("The heat from the forge fills the air. Weapons and armor line the walls.");
    console.log("\nWhat would you like to do?");
    console.log("1: Buy " + sword.name + " (" + sword.value + " gold)");
    console.log("2: Buy " + steelSword.name + " (" + steelSword.value + " gold)");
    console.log("3: Buy " + woodenShield.name + " (" + woodenShield.value + " gold)");
    console.log("4: Buy " + ironShield.name + " (" + ironShield.value + " gold)");
    console.log("5: Return to village");
    console.log("6: Check status");
    console.log("7: Use item");
    console.log("8: Help");
    console.log("9: Quit game");
  } else if (currentLocation === "market") {
    console.log("Merchants sell their wares from colorful stalls. A potion seller catches your eye.");
    console.log("\nWhat would you like to do?");
    console.log("1: Buy " + healthPotion.name + " (" + healthPotion.value + " gold)");
    console.log("2: Return to village");
    console.log("3: Check status");
    console.log("4: Use item");
    console.log("5: Help");
    console.log("6: Quit game");
  } else if (currentLocation === "forest") {
    console.log("The forest is dark and foreboding. You hear strange noises all around you.");
    console.log("\nWhat would you like to do?");
    console.log("1: Return to village");
    console.log("2: Check status");
    console.log("3: Use item");
    console.log("4: Help");
    console.log("5: Quit game");
  } else if (currentLocation === "mountains") {
    console.log("Jagged peaks pierce the sky. Sulfur hangs in the air... the dragon's lair is near.");
    console.log("\nWhat would you like to do?");
    console.log("1: Return to village");
    console.log("2: Check status");
    console.log("3: Use item");
    console.log("4: Help");
    console.log("5: Quit game");
  }
}

// ===========================
// Combat Functions (Task 2)
// ===========================

/**
 * Updates player health, keeping it between 0 and 100
 * @param {number} amount Amount to change health by (positive for healing, negative for damage)
 * @returns {number} The new health value
 */
function updateHealth(amount) {
  playerHealth += amount;

  if (playerHealth > 100) {
    playerHealth = 100;
    console.log("You're at full health!");
  }
  if (playerHealth < 0) {
    playerHealth = 0;
    console.log("You're gravely wounded!");
  }

  console.log("Health is now: " + playerHealth);
  return playerHealth;
}

/**
 * Handles monster battles.
 * Auto-selects best weapon/armor and supports a special dragon battle.
 * @param {boolean} isDragon
 * @returns {boolean} true if player wins (or game ends in victory), false otherwise (retreat/defeat)
 */
function handleCombat(isDragon = false) {
  const bestWeapon = getBestItem("weapon");
  const bestArmor = getBestItem("armor");

  if (isDragon) {
    console.log("\n🔥 The DRAGON emerges from the shadows!");
    if (!hasGoodEquipment()) {
      console.log("The dragon senses your weakness. You are forced to retreat!");
      updateHealth(-20);
      return false;
    }
  } else {
    console.log("\nA snarling beast lunges at you!");
  }

  // If player has no weapon at all, they must retreat (regular monsters)
  if (!bestWeapon) {
    console.log("Without a weapon, you must retreat!");
    updateHealth(-20);
    return false;
  }

  // Auto equipment selection + announce
  if (bestWeapon) {
    console.log("You attack with your " + bestWeapon.name + " (+" + bestWeapon.effect + " dmg).");
  }
  if (bestArmor) {
    console.log("You brace behind your " + bestArmor.name + " (+" + bestArmor.effect + " protection).");
  } else {
    console.log("You have no armor!");
  }

  // Monster stats
  let monsterHealth = isDragon ? 50 : 20;
  const monsterBaseDamage = isDragon ? 20 : 10;

  // Battle loop (simple turn-based)
  while (monsterHealth > 0 && playerHealth > 0) {
    // Player attacks
    const dealt = Math.max(1, bestWeapon.effect - monsterDefense);
    monsterHealth -= dealt;
    console.log(`You strike for ${dealt} damage. (Monster HP: ${Math.max(0, monsterHealth)})`);

    if (monsterHealth <= 0) break;

    // Monster attacks
    const armorProt = bestArmor ? bestArmor.effect : 0;
    const incoming = Math.max(1, monsterBaseDamage - armorProt);
    console.log(
      `The enemy hits for ${monsterBaseDamage}. Your armor reduces it by ${armorProt} → you take ${incoming}.`
    );
    updateHealth(-incoming);
  }

  // Outcome
  if (playerHealth <= 0) {
    console.log("\nYou collapse from your wounds...");
    return false;
  }

  if (isDragon) {
    console.log("\n🏆 You have slain the DRAGON! The realm is saved!");
    console.log("\n=== Final Stats ===");
    showStatus();
    gameRunning = false; // End the game on dragon victory
    return true;
  } else {
    console.log("Victory! You found 10 gold!");
    playerGold += 10;
    return true;
  }
}

// ===========================
// Item Usage & Inventory
// ===========================

/**
 * Handles using items like potions
 * @returns {boolean} true if item was used successfully, false if not
 */
function useItem() {
  if (inventory.length === 0) {
    console.log("\nYou have no items!");
    return false;
  }

  console.log("\n=== Inventory ===");
  inventory.forEach((item, index) => {
    console.log(index + 1 + ". " + item.name);
  });

  let choice = readline.question("Use which item? (number or 'cancel'): ");
  if (choice === "cancel") return false;

  let index = parseInt(choice) - 1;
  if (index >= 0 && index < inventory.length) {
    let item = inventory[index];

    if (item.type === "potion") {
      console.log("\nYou drink the " + item.name + ".");
      updateHealth(item.effect);
      inventory.splice(index, 1);
      console.log("Health restored to: " + playerHealth);
      return true;
    } else if (item.type === "weapon") {
      console.log("\nYou ready your " + item.name + " for battle. (Auto-equip uses best stats)");
      return true;
    } else if (item.type === "armor") {
      console.log("\nYou secure your " + item.name + ". (Auto-equip uses best stats)");
      return true;
    }
  } else {
    console.log("\nInvalid item number!");
  }
  return false;
}

/**
 * Displays the player's inventory
 */
function checkInventory() {
  console.log("\n=== INVENTORY ===");
  if (inventory.length === 0) {
    console.log("Your inventory is empty!");
    return;
  }
  inventory.forEach((item, index) => {
    console.log(index + 1 + ". " + item.name + " - " + item.description);
  });
}

// ===========================
// Shopping (Task 3)
// ===========================

function purchaseItem(template) {
  if (playerGold >= template.value) {
    console.log(`\nPurchase: ${template.name} for ${template.value} gold.`);
    playerGold -= template.value;
    inventory.push({ ...template }); // clone
    console.log(`You bought a ${template.name}!`);
    console.log("Gold remaining: " + playerGold);
  } else {
    console.log("\nYou don't have enough gold!");
  }
}

function buyFromMarket() {
  purchaseItem(healthPotion);
}

// ===========================
// Help System
// ===========================

function showHelp() {
  console.log("\n=== AVAILABLE COMMANDS ===");

  console.log("\nMovement:");
  console.log("- In the village, choose 1-4 to travel to locations");
  console.log("- Return options send you back to the village");

  console.log("\nBattle Information:");
  console.log("- You need a weapon to win battles");
  console.log("- Weapons deal damage; armor reduces incoming damage");
  console.log("- Monsters appear in the forest");
  console.log("- The Dragon lives in the mountains (boss battle)");

  console.log("\nEquipment Progression:");
  console.log("- Steel Sword is stronger than Sword");
  console.log("- Iron Shield protects more than Wooden Shield");
  console.log("- Dragon tip: Bring a Steel Sword and any armor");

  console.log("\nShopping:");
  console.log(`- Market sells ${healthPotion.name} for ${healthPotion.value} gold`);
  console.log(
    `- Blacksmith sells weapons & shields: ${sword.name}, ${steelSword.name}, ${woodenShield.name}, ${ironShield.name}`
  );

  console.log("\nOther:");
  console.log("- Status shows your health, gold, and auto-equipped best gear");
  console.log("- Help shows this message");
  console.log("- Quit ends the game");

  console.log("\nTips:");
  console.log("- Keep potions for tough fights");
  console.log("- Defeat monsters to earn gold");
  console.log("- Health can't go above 100");
}

// ===========================
// Movement (Task 3)
// ===========================

/**
 * Handles movement between locations and triggers encounters where appropriate
 * @param {number} choiceNum The chosen option number
 * @returns {boolean} True if movement was successful
 */
function move(choiceNum) {
  let validMove = false;

  if (currentLocation === "village") {
    if (choiceNum === 1) {
      currentLocation = "blacksmith";
      console.log("\nYou enter the blacksmith's shop.");
      validMove = true;
    } else if (choiceNum === 2) {
      currentLocation = "market";
      console.log("\nYou enter the market.");
      validMove = true;
    } else if (choiceNum === 3) {
      currentLocation = "forest";
      console.log("\nYou venture into the forest...");
      validMove = true;
      console.log("\nA monster appears!");
      handleCombat(false); // forest fight
      // After regular combat, you stay in forest until you choose to return
    } else if (choiceNum === 4) {
      // Mountains (Dragon)
      if (!hasGoodEquipment()) {
        console.log(
          "\nThe path is too dangerous. You need a Steel Sword and some armor before facing the dragon."
        );
        validMove = false;
      } else {
        currentLocation = "mountains";
        console.log("\nYou ascend into the mountains...");
        validMove = true;
        // Trigger dragon battle immediately
        const won = handleCombat(true);
        if (!won && gameRunning) {
          // If you didn't defeat the dragon (retreated or died but gameRunning means alive),
          // send back to village for another try.
          currentLocation = "village";
        }
      }
    }
  } else if (currentLocation === "blacksmith") {
    if (choiceNum === 5) {
      currentLocation = "village";
      console.log("\nYou return to the village center.");
      validMove = true;
    }
  } else if (currentLocation === "market") {
    if (choiceNum === 2) {
      currentLocation = "village";
      console.log("\nYou return to the village center.");
      validMove = true;
    }
  } else if (currentLocation === "forest") {
    if (choiceNum === 1) {
      currentLocation = "village";
      console.log("\nYou hurry back to the safety of the village.");
      validMove = true;
    }
  } else if (currentLocation === "mountains") {
    if (choiceNum === 1) {
      currentLocation = "village";
      console.log("\nYou descend from the mountains to the village.");
      validMove = true;
    }
  }

  return validMove;
}

// ===========================
// Input Validation
// ===========================

/**
 * Validates if a choice number is within valid range
 * @param {string} input The user input to validate
 * @param {number} max The maximum valid choice number
 * @returns {boolean} True if choice is valid
 */
function isValidChoice(input, max) {
  if (input === "") return false;
  let num = parseInt(input);
  return num >= 1 && num <= max;
}

// ===========================
// Main Game Loop
// ===========================

if (require.main === module) {
  console.log("=================================");
  console.log("       The Dragon's Quest        ");
  console.log("=================================");
  console.log("\nYour quest: Defeat the dragon in the mountains!");

  // Get player's name
  playerName = readline.question("\nWhat is your name, brave adventurer? ");
  console.log("\nWelcome, " + playerName + "!");
  console.log("You start with " + playerGold + " gold.");

  while (gameRunning) {
    // Show current location and choices
    showLocation();

    // Get and validate player choice
    let validChoice = false;
    while (!validChoice && gameRunning) {
      try {
        let choice = readline.question("\nEnter choice (number): ");

        // Check for empty input
        if (choice.trim() === "") {
          throw "Please enter a number!";
        }

        // Convert to number and check if it's a valid number
        let choiceNum = parseInt(choice);
        if (isNaN(choiceNum)) {
          throw "That's not a number! Please enter a number.";
        }

        // Handle choices based on location
        if (currentLocation === "village") {
          if (!isValidChoice(choice, 8)) {
            throw "Please enter a number between 1 and 8.";
          }

          validChoice = true;

          if (choiceNum <= 4) {
            move(choiceNum);
          } else if (choiceNum === 5) {
            showStatus();
          } else if (choiceNum === 6) {
            useItem();
          } else if (choiceNum === 7) {
            showHelp();
          } else if (choiceNum === 8) {
            gameRunning = false;
            console.log("\nThanks for playing!");
          }
        } else if (currentLocation === "blacksmith") {
          if (!isValidChoice(choice, 9)) {
            throw "Please enter a number between 1 and 9.";
          }

          validChoice = true;

          if (choiceNum === 1) {
            purchaseItem(sword);
          } else if (choiceNum === 2) {
            purchaseItem(steelSword);
          } else if (choiceNum === 3) {
            purchaseItem(woodenShield);
          } else if (choiceNum === 4) {
            purchaseItem(ironShield);
          } else if (choiceNum === 5) {
            move(choiceNum);
          } else if (choiceNum === 6) {
            showStatus();
          } else if (choiceNum === 7) {
            useItem();
          } else if (choiceNum === 8) {
            showHelp();
          } else if (choiceNum === 9) {
            gameRunning = false;
            console.log("\nThanks for playing!");
          }
        } else if (currentLocation === "market") {
          if (!isValidChoice(choice, 6)) {
            throw "Please enter a number between 1 and 6.";
          }

          validChoice = true;

          if (choiceNum === 1) {
            buyFromMarket();
          } else if (choiceNum === 2) {
            move(choiceNum);
          } else if (choiceNum === 3) {
            showStatus();
          } else if (choiceNum === 4) {
            useItem();
          } else if (choiceNum === 5) {
            showHelp();
          } else if (choiceNum === 6) {
            gameRunning = false;
            console.log("\nThanks for playing!");
          }
        } else if (currentLocation === "forest") {
          if (!isValidChoice(choice, 5)) {
            throw "Please enter a number between 1 and 5.";
          }

          validChoice = true;

          if (choiceNum === 1) {
            move(choiceNum);
          } else if (choiceNum === 2) {
            showStatus();
          } else if (choiceNum === 3) {
            useItem();
          } else if (choiceNum === 4) {
            showHelp();
          } else if (choiceNum === 5) {
            gameRunning = false;
            console.log("\nThanks for playing!");
          }
        } else if (currentLocation === "mountains") {
          if (!isValidChoice(choice, 5)) {
            throw "Please enter a number between 1 and 5.";
          }

          validChoice = true;

          if (choiceNum === 1) {
            move(choiceNum);
          } else if (choiceNum === 2) {
            showStatus();
          } else if (choiceNum === 3) {
            useItem();
          } else if (choiceNum === 4) {
            showHelp();
          } else if (choiceNum === 5) {
            gameRunning = false;
            console.log("\nThanks for playing!");
          }
        }
      } catch (error) {
        if (!gameRunning) break;
        console.log("\nError: " + error);
        console.log("Please try again!");
      }
    }

    // Check if player died
    if (playerHealth <= 0 && gameRunning) {
      console.log("\nGame Over! Your health reached 0!");
      gameRunning = false;
    }
  }
}
