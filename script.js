class PlayerMarkovApp {
  constructor(containerId, playerName) {
    this.container = document.getElementById(containerId);
    this.name = playerName;
    this.history = [];
    this.renderBase();
    this.update();
  }

  renderBase() {
    const pName = this.name.replace(" ", "");
    this.container.innerHTML = `
      <div class="controls">
          <strong style="display:block;">${this.name}</strong>
          <div class="btn-group">
              <button onclick="${pName}.add('🪨')">🪨</button>
              <button onclick="${pName}.add('📜')">📜</button>
              <button onclick="${pName}.add('✂️')">✂️</button>
          </div>
          <button class="undo-btn" onclick="${pName}.undo()">Undo</button>
          
         <div style="margin-top:75px; padding:10px; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0; font-size:0.85em;">
            <strong>Next likely move:</strong>
            <div id="${this.name}-pred" style="font-size:2em; text-align:center; margin-top:5px; min-height: 1.2em;">?</div>
            <div id="${this.name}-hint" style="font-size:0.8em; color:#666; text-align:center;">Fill all 9 numerators to reveal</div>
          </div>
      </div>

      <div class="dataset-section">
          <strong>Dataset</strong>
          <div class="grid" id="${this.name}-grid"></div>
      </div>

      <div class="markov-section">
          <img src="empty-markov.svg" class="markov-bg">
          <div class="node paper-node">📜</div>
          <div class="node rock-node">🪨</div>
          <div class="node scis-node">✂️</div>
          
          <div class="frac f-pp"><input type="text" data-from="📜" data-to="📜" oninput="${pName}.predict()"><div class="denom d-p">0</div></div>
          <div class="frac f-pr"><input type="text" data-from="📜" data-to="🪨" oninput="${pName}.predict()"><div class="denom d-p">0</div></div>
          <div class="frac f-ps"><input type="text" data-from="📜" data-to="✂️" oninput="${pName}.predict()"><div class="denom d-p">0</div></div>
          
          <div class="frac f-rr"><input type="text" data-from="🪨" data-to="🪨" oninput="${pName}.predict()"><div class="denom d-r">0</div></div>
          <div class="frac f-rp"><input type="text" data-from="🪨" data-to="📜" oninput="${pName}.predict()"><div class="denom d-r">0</div></div>
          <div class="frac f-rs"><input type="text" data-from="🪨" data-to="✂️" oninput="${pName}.predict()"><div class="denom d-r">0</div></div>
          
          <div class="frac f-ss"><input type="text" data-from="✂️" data-to="✂️" oninput="${pName}.predict()"><div class="denom d-s">0</div></div>
          <div class="frac f-sp"><input type="text" data-from="✂️" data-to="📜" oninput="${pName}.predict()"><div class="denom d-s">0</div></div>
          <div class="frac f-sr"><input type="text" data-from="✂️" data-to="🪨" oninput="${pName}.predict()"><div class="denom d-s">0</div></div>
      </div>
    `;
  }

  add(move) {
    this.history.push(move);
    this.update();
    this.predict(); // Update prediction when move is added
  }

  undo() {
    this.history.pop();
    this.update();
    this.predict(); // Update prediction when move is removed
  }

  predict() {
    const predDisplay = document.getElementById(`${this.name}-pred`);
    const hintDisplay = document.getElementById(`${this.name}-hint`);

    // 1. Grab all 9 number inputs within this player's specific container
    const allInputs = this.container.querySelectorAll('.markov-section input[type="number"], .markov-section input[type="text"]');

    // 2. Strict Check: Are all 9 filled with a character?
    let filledCount = 0;
    allInputs.forEach((input) => {
      // Check if the trimmed value is not an empty string
      if (input.value.trim() !== "") {
        filledCount++;
      }
    });

    // 3. Hide logic: If fewer than 9 are filled, or no history exists, FORCE HIDE
    if (filledCount < 9 || this.history.length === 0) {
      predDisplay.innerHTML = "?";
      if (hintDisplay) {
        hintDisplay.style.display = "block";
        hintDisplay.textContent = `Fill all 9 numerators (${filledCount}/9)`;
      }
      return;
    }

    // 4. Reveal Logic (Only runs if we pass the 9/9 check)
    if (hintDisplay) hintDisplay.style.display = "none";

    const lastMove = this.history[this.history.length - 1];
    const relevantInputs = this.container.querySelectorAll(`input[data-from="${lastMove}"]`);

    // Get the current denominator from the UI
    const denomEl = relevantInputs[0].parentElement.querySelector(".denom");
    const denominator = parseInt(denomEl.textContent) || 0;

    let maxVal = -1;
    let winners = [];

    relevantInputs.forEach((input) => {
      const val = parseInt(input.value) || 0;
      if (val > maxVal) {
        maxVal = val;
        winners = [input.getAttribute("data-to")];
      } else if (val === maxVal && val >= 0) {
        winners.push(input.getAttribute("data-to"));
      }
    });

    // 5. Calculate Probability
    let probResult = "";
    if (denominator > 0 && maxVal >= 0) {
      const percentage = Math.round((maxVal / denominator) * 100);
      probResult = `<div style="font-size: 0.5em; color: #059669; font-weight: bold;">${percentage}% probability</div>`;
    }

    predDisplay.innerHTML = `
    <div>${winners.join(" ")}</div>
    ${probResult}
  `;
  }

  update() {
    const grid = document.getElementById(`${this.name}-grid`);
    grid.innerHTML = "";
    for (let i = 0; i < 40; i++) {
      const box = document.createElement("div");
      box.className = "box";
      box.textContent = this.history[i] || "";
      grid.appendChild(box);
    }

    let counts = { "🪨": 0, "📜": 0, "✂️": 0 };
    for (let i = 0; i < this.history.length - 1; i++) {
      counts[this.history[i]]++;
    }

    this.container.querySelectorAll(".d-r").forEach((el) => (el.textContent = counts["🪨"]));
    this.container.querySelectorAll(".d-p").forEach((el) => (el.textContent = counts["📜"]));
    this.container.querySelectorAll(".d-s").forEach((el) => (el.textContent = counts["✂️"]));
  }
}

const Player1 = new PlayerMarkovApp("p1-root", "Player 1");
const Player2 = new PlayerMarkovApp("p2-root", "Player 2");
