class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    // Connect to MongoDB here
  }

  isAlive() {
    // Check if the connection to MongoDB is alive
  }

  async nbUsers() {
    // Return the number of documents in the collection "users"
  }

  async nbFiles() {
    // Return the number of documents in the collection "files"
  }
}

const dbClient = new DBClient();

export default dbClient;
