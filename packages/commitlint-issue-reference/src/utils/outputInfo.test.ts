import { outputFoundTicketInBranch } from './outputInfo.js';

describe('outputFoundTicketInBranch', () => {
  it('should output the ticket', () => {
    const ticket = 'ABC-1234';
    const spy = jest.spyOn(console, 'log').mockImplementation();
    outputFoundTicketInBranch(ticket);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining(ticket));
    spy.mockRestore();
  });
});
