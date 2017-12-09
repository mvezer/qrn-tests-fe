const BALL_WIDTH_PERCENTAGE = 0.05;

// ======================= AssetManager ========================
const AssetManager = function assetManager() {
  this.assets = {};
  this.onLoadWatches = [];

  this.init();
};

AssetManager.prototype.loadSprite = function loadSprite(id, url, onLoadCallback = undefined) {
  if (this.assets.hasOwnProperty(id)) {
    throw new Error(`The id "${id}" already exists in the asset manager`);
  }
  this.assets[id] = new PIXI.Sprite.fromImage(url);
  if (onLoadCallback) {
    this.registerOnLoad(id, onLoadCallback);
  }
};

AssetManager.prototype.registerOnLoad = function registerOnLoad(id, onLoadCallback) {
  this.onLoadWatches.push({id: id, callback: onLoadCallback});
  console.log('registering');
  console.log({id: id, callback: onLoadCallback});
};

AssetManager.prototype.unregisterOnLoad = function unregisterOnLoad(id) {
  const idxToRemove = this.onLoadWatches.findIndex((i) => { return i.id == id; });
  if (idxToRemove != -1) {
    this.onLoadWatches.splice(idxToRemove);
  }
};

AssetManager.prototype.onLoadWatcher = function onLoadWatcher(dt) {
  this.onLoadWatches.forEach((i) => {
    const item = this.assets[i.id];
    if (item.width > 1 || item.height > 1) {
      i.callback(i.id);
      this.unregisterOnLoad(i.id);
    }
  }, this);
};

AssetManager.prototype.get = function get(id) {
  if (!this.assets.hasOwnProperty(id)) {
    throw new Error(`The id "${id}" does not exist in the asset manager`);
  }

  return this.assets[id];
};

AssetManager.prototype.init = function init() {
  this.onLoadTicker = new PIXI.ticker.Ticker();
  this.onLoadTicker.add(this.onLoadWatcher.bind(this));
  this.onLoadTicker.start();
};

// ======================= App ========================
const App = function app(canvasId) {
  this.viewCanvas = document.getElementById(canvasId);
  this.renderer = undefined;
  this.assetManager = new AssetManager();
};

App.prototype.onLoadReady = function onLoadReady() {
  this.ballSprite = this.assetManager.get('ballSprite');
  this.ballSprite.position.x = 0;
  this.ballSprite.position.y = 0;
  this.ballSprite.scale.x = this.ballSprite.scale.y = (BALL_WIDTH_PERCENTAGE * this.stageWidth) / this.ballSprite.width;
  console.log(this.ballSprite)
  this.stage.addChild(this.ballSprite);
  requestAnimationFrame(this.update.bind(this));
  console.log('resources ready');
};

App.prototype.onResize = function onResize(event) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  this.renderer.view.style.width = w + "px";
  this.renderer.view.style.height = h + "px";    
  this.renderer.resize(w,h);
  this.stageWidth = w;
  this.stageHeight = h;
};

App.prototype.init = function init() {
  this.stage = new PIXI.Container();
  this.renderer = PIXI.autoDetectRenderer(512, 384, {view:this.viewCanvas});
  this.onResize();
  this.assetManager.loadSprite('ballSprite', 'images/ball.png', this.onLoadReady.bind(this));
};

App.prototype.update = function update(){
  this.ballSprite.position.x += 2;
  this.ballSprite.position.y += 2;

  this.renderer.render(this.stage);
  requestAnimationFrame(this.update.bind(this));
}