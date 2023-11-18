import 'reflect-metadata';
import { Post } from './src/entity/Post';
import { AppDataSource } from './src/data-source';

AppDataSource.initialize().then(async () => {
  // Expose entities and connection to global scope
  (global as any).Post = Post;
  (global as any).ads = AppDataSource;

  // Start the REPL
  require('repl').start({});
});