import React from 'react';

import { AfterData, AfterRoot } from '@jaredpalmer/after';

class Document extends React.Component<any, any> {
  public static async getInitialProps({ assets, data, renderPage }: any) {
    const page = await renderPage();
    return { assets, data, ...page };
  }

  public render() {
    const { helmet, assets, data } = this.props;
    // get attributes from React Helmet
    const htmlAttrs = helmet.htmlAttributes.toComponent();
    const bodyAttrs = helmet.bodyAttributes.toComponent();

    return (
      <html {...htmlAttrs}>
        <head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta charSet="utf-8" />
          <title>test</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
          {assets.client.css && (<link rel="stylesheet" href={assets.client.css} />)}
        </head>
        <body {...bodyAttrs}>
          <AfterRoot />
          <AfterData data={data} />
          <script
            type="text/javascript"
            src={assets.client.js}
            defer={true}
            crossOrigin="anonymous"
          />
        </body>
      </html>
    );
  }
}

export default Document;