/**
 * Used inside pipelines, this adds a log with the current value of the
 * pipeline along with a message.
 *
 * Example:
 * pipe(
 *   O.fromNullable('Yay!'),
 *   log('The value is: '),
 *   O.map(v => v.reverse())
 *   log('The value reversed: ')
 * )
 */
export const log = (message: string = new Date().toString()) => <V>(
  val: V
): V => {
  console.log(message, val);
  return val;
};
