const ejs = require("ejs");
const path = require("path");
const { promisify } = require("util");
const fs = require("fs");
const prettier = require("prettier");

const goals = require("./goals");
const disciplines = require("./disciplines");
const version = require("./package").version;

const render = promisify(ejs.renderFile);
const write = promisify(fs.writeFile);

const Card = ({ name, description, discipline, category, principles }) =>
  `<div class="card">
    <h2>${name}</h2>
    <p>${description}</p>
    <div class="card__details">
        <div class="principles">
            <strong>Principles</strong>
            ${principles.map((p) => `<p>${p}</p>`).join("\n")}
        </div>
        <div class="discipline">
            <strong>Discipline</strong>
            <p>
              <a href="#/${category.toLowerCase()}/${name
    .toLowerCase()
    .replace(
      /\s/g,
      "-"
    )}/discipline/${discipline.toLowerCase()}">${discipline}</a>
            </p>
        </div>
    </div>
</div>`;

const DisciplineCard = ({ name, description, verse }) =>
`<div class="card">
    <h2>${name}</h2>
    ${description.split('\n').map((d) => `<p>${d}</p>`).join('\n')}
    <div class="card__details">
      <div class="verse">
          <p>${verse.content}</p>
          <strong>${verse.ref}</strong>
      </div>
  </div>
</div>`;

const Category = ({ idx, content, name }) =>
  `<div class="category${
    idx === 0 ? " active" : ""
  }" data-category="${name.toLowerCase()}">
    ${content}
</div>`;

const Header = (title, content) =>
  `<header>
    <a href="" id="prev"><span class="material-icons">chevron_left</span></a>
    <h1>${title}</h1>
    <a href="" id="next"><span class="material-icons">chevron_right</span></a>
</header>\n${content} 
`;

const Modal = ({ name, verse, practices }) => `
<script type="template/html" data-discipline="${name
  .toLowerCase()
  .replace(/\s/g, "-")}">
    <h2>${name}</h2>
    <div class="verse">
        <p>${verse.content}</p>
        <strong>${verse.ref}</strong>
    </div>
    <strong>Practices</strong>
    <ul>
        ${Object.keys(practices)
          .map((k) => `<li data-parent="${k}">${practices[k]}</li>`)
          .join("\n")}
    </ul>
</script>
`;

(async () => {
  const categories = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(Card(goal));
    return acc;
  }, {});

  const pages = Object.keys(categories)
    .map((key, idx) =>
      Category({ idx, content: categories[key].join("\n"), name: key })
    )
    .join("\n");

  const content = [
    Header(Object.keys(categories)[0], pages),
    ...disciplines.map(Modal),
  ].join("\n");

  const disciplineContent = disciplines
    .filter(({ description }) => description)
    .map(DisciplineCard)
    .join('\n');

  const matrix = await render(path.join(__dirname, "template.ejs"), {
    content,
    year: new Date().getFullYear(),
    version,
  });
  const discipline = await render(path.join(__dirname, 'disciplines.ejs'), {
    content: disciplineContent,
    year: new Date().getFullYear(),
    version,
  })

  await Promise.all([
    write(
      path.join(__dirname, "index.html"),
      prettier.format(matrix, { parser: "html" })
    ),
    write(
      path.join(__dirname, "disciplines.html"),
      prettier.format(discipline, { parser: "html" })
    ),
  ]);
})();
