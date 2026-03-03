/**
 * Parse time string to cron expression
 * @param time - Time string like '5s', '10m', '2h', '1d'
 * @returns Cron expression
 */
export const parseTimeToCronExpression = (time: string): string => {
  const match = time.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(
      `Invalid expiration time format: ${time}. Expected format is a number followed by 's', 'm', 'h', or 'd'.`,
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return `*/${value} * * * * *`;
    case 'm':
      return `0 */${value} * * * *`;
    case 'h':
      return `0 0 */${value} * * *`;
    case 'd':
      return `0 0 0 */${value} * *`;
    default:
      throw new Error(
        `Invalid time unit: ${unit}. Expected 's', 'm', 'h', or 'd'.`,
      );
  }
};
