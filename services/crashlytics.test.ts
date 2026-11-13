import { CrashlyticsService } from './crashlytics';

const mockSetUserId = jest.fn().mockResolvedValue(undefined);
const mockSetAttribute = jest.fn().mockResolvedValue(undefined);
const mockLog = jest.fn();
const mockRecordError = jest.fn();

jest.mock('@react-native-firebase/crashlytics', () => {
  const mockFn = jest.fn(() => ({
    setUserId: mockSetUserId,
    setAttribute: mockSetAttribute,
    log: mockLog,
    recordError: mockRecordError,
  }));
  return {
    __esModule: true,
    default: mockFn,
  };
});

describe('CrashlyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setUserId', () => {
    it('sets user id as string when numeric ID is provided', async () => {
      await CrashlyticsService.setUserId(12345);
      expect(mockSetUserId).toHaveBeenCalledWith('12345');
    });

    it('sets user id directly when string ID is provided', async () => {
      await CrashlyticsService.setUserId('user_abc');
      expect(mockSetUserId).toHaveBeenCalledWith('user_abc');
    });

    it('handles native crashlytics error gracefully without throwing', async () => {
      mockSetUserId.mockRejectedValueOnce(new Error('Native error'));
      await expect(CrashlyticsService.setUserId('123')).resolves.not.toThrow();
    });
  });

  describe('clearUser', () => {
    it('clears user id by passing empty string', async () => {
      await CrashlyticsService.clearUser();
      expect(mockSetUserId).toHaveBeenCalledWith('');
    });
  });

  describe('setAttribute', () => {
    it('sets attribute key and string value', async () => {
      await CrashlyticsService.setAttribute('email', 'test@example.com');
      expect(mockSetAttribute).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('handles attribute error gracefully', async () => {
      mockSetAttribute.mockRejectedValueOnce(new Error('Attribute error'));
      await expect(
        CrashlyticsService.setAttribute('key', 'val')
      ).resolves.not.toThrow();
    });
  });

  describe('log', () => {
    it('records breadcrumb log message', () => {
      CrashlyticsService.log('User navigated to messages');
      expect(mockLog).toHaveBeenCalledWith('User navigated to messages');
    });

    it('handles log error gracefully without throwing', () => {
      mockLog.mockImplementationOnce(() => {
        throw new Error('Log error');
      });
      expect(() => CrashlyticsService.log('test')).not.toThrow();
    });
  });

  describe('recordError', () => {
    it('records native Error instance with optional name', () => {
      const error = new Error('Test failure');
      CrashlyticsService.recordError(error, 'CustomErrorName');
      expect(mockRecordError).toHaveBeenCalledWith(error, 'CustomErrorName');
    });

    it('wraps string error in an Error instance before recording', () => {
      CrashlyticsService.recordError('String message', 'StringError');
      expect(mockRecordError).toHaveBeenCalledWith(
        expect.any(Error),
        'StringError'
      );
      expect(mockRecordError.mock.calls[0][0].message).toBe('String message');
    });

    it('handles recordError failure gracefully without throwing', () => {
      mockRecordError.mockImplementationOnce(() => {
        throw new Error('Record error');
      });
      expect(() => CrashlyticsService.recordError(new Error('Fail'))).not.toThrow();
    });
  });
});
