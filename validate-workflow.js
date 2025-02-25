import fs from "fs";

// Load the sample workflow
try {
  const sampleWorkflow = JSON.parse(
    fs.readFileSync("./sample-workflow.json", "utf8")
  );
  console.log("Successfully loaded sample workflow");

  // Validate workflow structure
  console.log("\nValidating workflow structure...");

  // Check required top-level properties
  const requiredProps = ["version", "exportedAt", "objects", "references"];
  const missingProps = requiredProps.filter((prop) => !sampleWorkflow[prop]);

  if (missingProps.length > 0) {
    console.error(
      `\nERROR: Missing required properties: ${missingProps.join(", ")}`
    );
    process.exit(1);
  }

  // Find the main workflow object
  const mainWorkflow = Object.values(sampleWorkflow.objects).find(
    (obj) => obj.type === "workflow" && Array.isArray(obj.fields?.tasks)
  );

  if (!mainWorkflow) {
    console.error("\nERROR: No valid workflow object found with tasks array");
    process.exit(1);
  }

  // Validate tasks
  const tasks = mainWorkflow.fields.tasks;
  console.log(`\nFound ${tasks.length} tasks in the workflow`);

  // Check task connections
  const taskIds = new Set(tasks.map((task) => task.id));
  const connections = [];

  tasks.forEach((task) => {
    if (Array.isArray(task.next)) {
      task.next.forEach((transition) => {
        if (Array.isArray(transition.do)) {
          transition.do.forEach((targetId) => {
            if (taskIds.has(targetId)) {
              connections.push({
                source: task.id,
                target: targetId,
                label: transition.label || "Unlabeled",
              });
            } else {
              console.warn(
                `\nWARNING: Task ${task.id} references non-existent target ${targetId}`
              );
            }
          });
        }
      });
    }
  });

  console.log(`\nFound ${connections.length} valid connections between tasks`);

  // Check references
  const referenceCount = Object.keys(sampleWorkflow.references).length;
  console.log(`\nFound ${referenceCount} references in the workflow`);

  // Print summary
  console.log("\n=== Workflow Validation Summary ===");
  console.log(`Total tasks: ${tasks.length}`);
  console.log(`Total connections: ${connections.length}`);
  console.log(`Total references: ${referenceCount}`);
  console.log("Validation successful!");

  // Print task details
  console.log("\nTask Details:");
  tasks.forEach((task) => {
    console.log(
      `- ${task.id}: ${task.name || "Unnamed"} (${task.type || "Unknown type"})`
    );
    if (task.action?.ref) {
      console.log(`  Action: ${task.action.ref}`);
    }
    if (Array.isArray(task.next) && task.next.length > 0) {
      console.log(`  Transitions: ${task.next.length}`);
      task.next.forEach((transition) => {
        const targets = Array.isArray(transition.do)
          ? transition.do.join(", ")
          : "none";
        console.log(`    - ${transition.label || "Unlabeled"} → ${targets}`);
      });
    }
  });
} catch (error) {
  console.error("Error validating workflow:", error);
}
