

const FunctionCache = new Map();

const renderTemplate = (tpl) => new Function("point", "return " + "`" + tpl.replace(/%\{/g, "${point.") + "`");

export const renderTooltipTemplate = (point) => {
  const template = point.data.hovertemplate?.trim();
  let func = FunctionCache.get(template);
  if(!func) {
    func = renderTemplate(template);
    FunctionCache.set(template, func);
  }
  return func(point);
};
  