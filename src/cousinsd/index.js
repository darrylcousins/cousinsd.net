#!/usr/bin/env node

import dotenv from 'dotenv';
import main from './bin/cgi.js';

dotenv.config();

main();

