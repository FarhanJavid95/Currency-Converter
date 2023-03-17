import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class LocalHistoryService {

  // Define the table name
  private tableName = "HistoryTable";

  constructor() {}

  // Too store data in cache.
 
  private create(data:any[]): void {
    localStorage.setItem(this.tableName, data.toString());
  }


  public update(data: any[]): void {
    // Check if a key exists in the cache
    if (localStorage.getItem(this.tableName) !== null) {
      // The key exists in the cache
      localStorage.setItem(this.tableName, JSON.stringify(data));
    } else {
      // The key does not exist in the cache
      this.create(data);
    }
  }

  public getData(): any[] {
    // Retrieve the object from the cache
    const storedValue = localStorage.getItem(this.tableName);
    const data = JSON.parse(storedValue!);
    return data;
  }


  // Too store data in history removed after browser closes.
  // Check if the table already exists
  private tableExists(): boolean {
    const history = window.history;
    const state = history.state || {};
    const data = state[this.tableName] || [];
    return Array.isArray(data);
  }

  // Create the table if it doesn't exist
  private createTable(): void {
    if (!this.tableExists()) {
      const history = window.history;
      const state = history.state || {};
      state[this.tableName] = [];
      history.replaceState(state, "");
    }
  }

  // Update the table with new data
  public updateTable(data: any[]): void {
    this.createTable();
    const history = window.history;
    const state = history.state || {};
    state[this.tableName] = data;
    history.replaceState(state, "");
  }

  // Retrieve data from the table
  public getTableData(): any[] {
    this.createTable();
    const history = window.history;
    const state = history.state || {};
    const data = state[this.tableName] || [];
    return data;
  }
}
