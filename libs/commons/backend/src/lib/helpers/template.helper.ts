import Handlebars from 'handlebars';
import mjml from 'mjml';

export class TemplateHelper {
  public static generateDocument(templateHtml: string, data: unknown): string {
    const template = Handlebars.compile(templateHtml);
    return template(data);
  }

  public static generateDocumentFromMJML(
    templateMjml: string,
    data: unknown,
  ): string {
    const { html } = mjml(templateMjml);
    return this.generateDocument(html, data);
  }
}
