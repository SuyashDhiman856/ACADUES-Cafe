import { useState, useEffect, useCallback } from "react";

import { settingsAPI, Settings } from "../api/settings";

import { SystemSettings } from "../types/systemSettings";

import { mapSettingsToSystemSettings, reverseMapSystemSettingsToSettings } from "../mappers/settings.mapper";


interface UseSettingsReturn {

  settings: SystemSettings | null;

  loading: boolean;

  error: string | null;

  fetchSettings: () => Promise<void>;

  updateSettings: (
    newSettings: SystemSettings
  ) => Promise<SystemSettings | null>;

}


export const useSettings =
  (): UseSettingsReturn => {

  const [settings, setSettings] =
    useState<SystemSettings | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  const fetchSettings =
    useCallback(async () => {

      try {

        setLoading(true);

        setError(null);

        const apiSettings =
          await settingsAPI.get();

        const mappedSettings =
          mapSettingsToSystemSettings(
            apiSettings
          );

        setSettings(mappedSettings);

      }
      catch (err: any) {

        setError(
          err?.response?.data?.message ||
          "Failed to fetch settings"
        );

      }
      finally {

        setLoading(false);

      }

    }, []);


  const updateSettings =
    useCallback(
      async (
        newSettings: SystemSettings
      ): Promise<SystemSettings | null> => {

        try {

          setLoading(true);

          setError(null);

          const dto = reverseMapSystemSettingsToSettings(newSettings);

          const updated =
            await settingsAPI.update(dto);

          const mappedSettings =
            mapSettingsToSystemSettings(
              updated
            );

          setSettings(mappedSettings);

          return mappedSettings;

        }
        catch (err: any) {

          setError(
            err?.response?.data?.message ||
            "Failed to update settings"
          );

          return null;

        }
        finally {

          setLoading(false);

        }

      },
      []
    );


  useEffect(() => {

    fetchSettings();

  }, [fetchSettings]);


  return {

    settings,

    loading,

    error,

    fetchSettings,

    updateSettings,

  };

};