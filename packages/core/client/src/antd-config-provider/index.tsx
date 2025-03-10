import { ConfigProvider, Spin } from 'antd';
import moment from 'moment';
import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useAPIClient, useRequest } from '../api-client';
import { loadConstrueLocale } from './loadConstrueLocale';

export const AppLangContext = createContext<any>({});

export const useAppLangContext = () => {
  return useContext(AppLangContext);
};

export function AntdConfigProvider(props) {
  const { remoteLocale, ...others } = props;
  const api = useAPIClient();
  const { i18n } = useTranslation();
  const { data, loading } = useRequest(
    {
      url: 'app:getLang',
      params: {
        locale: api.auth.locale,
      },
    },
    {
      onSuccess(data) {
        const locale = api.auth.locale;
        if (data?.data?.lang && !locale) {
          api.auth.setLocale(data?.data?.lang);
          i18n.changeLanguage(data?.data?.lang);
        }
        Object.keys(data?.data?.resources || {}).forEach((key) => {
          i18n.addResources(data?.data?.lang, key, data?.data?.resources[key] || {});
        });
        loadConstrueLocale(data?.data);
        moment.locale(data?.data?.moment);
        window['cronLocale'] = data?.data?.cron;
      },
      manual: !remoteLocale,
    },
  );
  if (loading) {
    return <Spin />;
  }
  return (
    <AppLangContext.Provider value={data?.data}>
      <ConfigProvider dropdownMatchSelectWidth={false} {...others} locale={data?.data?.antd || {}}>
        {props.children}
      </ConfigProvider>
    </AppLangContext.Provider>
  );
}
