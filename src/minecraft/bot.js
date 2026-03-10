/**
 * Minecraft 机器人控制器
 * 基于 mineflayer
 */

import { EventEmitter } from 'eventemitter3';
import mineflayer from 'mineflayer';

export class MinecraftBot extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.bot = null;
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.bot = mineflayer.createBot({
          host: this.config.host,
          port: this.config.port,
          username: this.config.username,
          auth: this.config.auth,
          version: false // 自动检测版本
        });

        this.bot.on('spawn', () => {
          this.connected = true;
          console.log(`🎮 已连接 Minecraft 服务器 (${this.config.host}:${this.config.port})`);
          console.log(`📍 位置：${this.bot.entity.position}`);
          resolve();
        });

        this.bot.on('error', (err) => {
          console.error('Minecraft 连接错误:', err.message);
          this.connected = false;
          resolve(); // 不阻断主程序
        });

        this.bot.on('kicked', (reason) => {
          console.log('被踢出服务器:', reason);
          this.connected = false;
        });

        // 聊天监听
        this.bot.on('chat', (username, message) => {
          if (username !== this.config.username) {
            console.log(`[MC] ${username}: ${message}`);
            this.emit('chat', { username, message });
          }
        });

      } catch (err) {
        reject(err);
      }
    });
  }

  async execute(command) {
    if (!this.connected || !this.bot) {
      console.warn('Minecraft 未连接');
      return;
    }

    console.log(`🎮 执行命令：${command}`);

    try {
      // 解析并执行命令
      if (command.startsWith('/')) {
        this.bot.chat(command);
      } else if (command.startsWith('move ')) {
        await this.move(command.split(' ')[1]);
      } else if (command.startsWith('look ')) {
        await this.look(command.split(' ')[1]);
      } else if (command.startsWith('mine ')) {
        await this.mine(command.split(' ')[1]);
      } else if (command.startsWith('place ')) {
        await this.place(command.split(' ')[1]);
      } else {
        this.bot.chat(command);
      }
    } catch (err) {
      console.error('命令执行失败:', err.message);
    }
  }

  async move(direction) {
    const dx = { north: 0, south: 0, east: 1, west: -1 }[direction] || 0;
    const dz = { north: -1, south: 1, east: 0, west: 0 }[direction] || 0;
    
    if (dx || dz) {
      this.bot.setControlState('forward', direction === 'north' || direction === 'south');
      this.bot.setControlState('back', direction === 'south' || direction === 'north');
      this.bot.setControlState('left', direction === 'west');
      this.bot.setControlState('right', direction === 'east');
      
      setTimeout(() => {
        this.bot.clearControlStates();
      }, 1000);
    }
  }

  async look(direction) {
    const yaw = { north: 0, east: 90, south: 180, west: 270 }[direction];
    if (yaw !== undefined) {
      this.bot.look(yaw * Math.PI / 180, 0);
    }
  }

  async mine(blockName) {
    // 简化的挖掘逻辑
    const block = this.bot.findBlock({
      matching: (b) => b && b.name === blockName,
      maxDistance: 4
    });
    
    if (block) {
      this.bot.dig(block);
    }
  }

  async place(itemName) {
    // 简化的放置逻辑
    const referenceBlock = this.bot.findBlock({
      maxDistance: 4
    });
    
    if (referenceBlock) {
      const item = this.bot.inventory.findInventoryItem(itemName);
      if (item) {
        this.bot.equip(item, 'hand');
        // 放置逻辑...
      }
    }
  }

  async chat(message) {
    if (this.connected) {
      this.bot.chat(message);
    }
  }

  getPosition() {
    if (this.bot) {
      return this.bot.entity.position;
    }
    return null;
  }

  async disconnect() {
    if (this.bot) {
      this.bot.quit();
      this.connected = false;
      console.log('🎮 已断开 Minecraft');
    }
  }
}
