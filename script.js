class PlayerMarkovApp {
  constructor(containerId, playerName) {
    this.container = document.getElementById(containerId);
    this.name = playerName;
    this.history = [];
    this.renderBase();
    this.update();
  }

  renderBase() {
    this.container.innerHTML = `
                    <div class="controls">
                        <strong style="display:block;">${this.name}</strong>
                        <div class="btn-group">
                            <button onclick="${this.name.replace(" ", "")}.add('🪨')">🪨</button>
                            <button onclick="${this.name.replace(" ", "")}.add('📜')">📜</button>
                            <button onclick="${this.name.replace(" ", "")}.add('✂️')">✂️</button>
                        </div>
                        <button class="undo-btn" onclick="${this.name.replace(" ", "")}.undo()">Undo</button>
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
                        
                        <div class="frac f-pp"><input type="text"><div class="denom d-p">0</div></div>
                        <div class="frac f-pr"><input type="text"><div class="denom d-p">0</div></div>
                        <div class="frac f-ps"><input type="text"><div class="denom d-p">0</div></div>
                        <div class="frac f-rr"><input type="text"><div class="denom d-r">0</div></div>
                        <div class="frac f-rp"><input type="text"><div class="denom d-r">0</div></div>
                        <div class="frac f-rs"><input type="text"><div class="denom d-r">0</div></div>
                        <div class="frac f-ss"><input type="text"><div class="denom d-s">0</div></div>
                        <div class="frac f-sp"><input type="text"><div class="denom d-s">0</div></div>
                        <div class="frac f-sr"><input type="text"><div class="denom d-s">0</div></div>
                    </div>
                `;
  }

  add(move) {
    this.history.push(move);
    this.update();
  }

  undo() {
    this.history.pop();
    this.update();
  }

  update() {
    // Update Grid
    const grid = document.getElementById(`${this.name}-grid`);
    grid.innerHTML = "";
    for (let i = 0; i < 40; i++) {
      const box = document.createElement("div");
      box.className = "box";
      box.textContent = this.history[i] || "";
      grid.appendChild(box);
    }

    // Calculate Denominators (total transitions AWAY from a state)
    let counts = { "🪨": 0, "📜": 0, "✂️": 0 };
    for (let i = 0; i < this.history.length - 1; i++) {
      counts[this.history[i]]++;
    }

    // Apply to UI
    this.container.querySelectorAll(".d-r").forEach((el) => (el.textContent = counts["🪨"]));
    this.container.querySelectorAll(".d-p").forEach((el) => (el.textContent = counts["📜"]));
    this.container.querySelectorAll(".d-s").forEach((el) => (el.textContent = counts["✂️"]));
  }
}

// Initialize the two players
// We name the variables Player1 and Player2 so the buttons can find them
const Player1 = new PlayerMarkovApp("p1-root", "Player 1");
const Player2 = new PlayerMarkovApp("p2-root", "Player 2");
