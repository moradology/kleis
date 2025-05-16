import '@testing-library/jest-dom'; // Extends expect with jest-dom matchers

// You can add other global setup configurations here if needed.
// For example, mocking global objects or functions.

// Example: Mock a global function if needed for all tests
// global.myGlobalFunction = vi.fn();

// Clean up after each test if using MSW or similar
// import { server } from './src/mocks/server'; // if you use MSW
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
